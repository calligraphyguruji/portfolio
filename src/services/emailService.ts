import { ContactFormData, ContactResponse } from '../types';

/**
 * Validates email address format on the client side.
 * 
 * ============================================================================
 * IMPORTANT SECURITY PRINCIPLE & LIMITATION DISCLAIMER:
 * ============================================================================
 * 1. Syntax validation only proves lexical conformance to the email format.
 * 2. It DOES NOT prove that the email address actually exists.
 * 3. It DOES NOT prove that the target domain has active Mail Exchange (MX) records.
 * 4. It DOES NOT prove that the person submitting the form owns or controls the address;
 *    any visitor can enter a valid third-party email address.
 * 
 * Syntax validation is purely a client-side convenience to catch typos and
 * reject obviously malformed entries early. Real anti-abuse defense relies on
 * the multi-layer pipeline:
 *   - Invisible honeypot traps
 *   - Cloudflare Turnstile cryptographic bot verification
 *   - Server-side sliding-window rate limiting per IP and per email
 *   - Duplicate message fingerprinting
 *   - Serverless endpoint isolation (EmailJS credentials never reach the browser)
 * ============================================================================
 */
export const isValidEmail = (email: string): boolean => {
  const trimmed = email.trim();
  if (!trimmed || trimmed.length < 5 || trimmed.length > 100) {
    return false;
  }

  // Reject consecutive dots or invalid punctuation
  if (trimmed.includes('..') || trimmed.startsWith('.') || trimmed.endsWith('.')) {
    return false;
  }

  // RFC 5322 compliant regex for practical frontend validation
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

  if (!emailRegex.test(trimmed)) {
    return false;
  }

  // Ensure valid domain and top-level domain (TLD >= 2 chars)
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const domain = parts[1];
  const tld = domain.split('.').pop();
  if (!tld || tld.length < 2 || !/^[a-zA-Z]+$/.test(tld)) {
    return false;
  }

  return true;
};

/**
 * Validates form fields before submission.
 */
export const validateContactInput = (
  data: ContactFormData
): { valid: boolean; error?: string } => {
  const trimmedName = data.name.trim();
  const trimmedEmail = data.email.trim();
  const trimmedMessage = data.message.trim();

  if (!trimmedName) {
    return { valid: false, error: 'Please enter your name.' };
  }
  if (trimmedName.length < 2 || trimmedName.length > 100) {
    return { valid: false, error: 'Name must be between 2 and 100 characters.' };
  }

  if (!trimmedEmail) {
    return { valid: false, error: 'Please enter your email address.' };
  }
  if (!isValidEmail(trimmedEmail)) {
    return { valid: false, error: 'Please enter a valid email address (e.g. name@example.com).' };
  }

  if (data.subject && data.subject.trim().length > 150) {
    return { valid: false, error: 'Subject cannot exceed 150 characters.' };
  }

  if (!trimmedMessage) {
    return { valid: false, error: 'Please enter a message.' };
  }
  if (trimmedMessage.length < 10) {
    return { valid: false, error: 'Message is too short. Please provide at least 10 characters.' };
  }
  if (trimmedMessage.length > 3000) {
    return { valid: false, error: 'Message is too long (maximum 3000 characters).' };
  }

  return { valid: true };
};

/**
 * Dispatches contact form payload through the secure serverless anti-spam pipeline (/api/contact).
 *
 * Security Pipeline:
 *   1. Honeypot check (silently drop bot submissions without hitting server or EmailJS)
 *   2. Client input validation
 *   3. POST /api/contact
 *   4. Server-side Rate Limiting (IP & Email)
 *   5. Server-side Cloudflare Turnstile token validation
 *   6. Spam content heuristics & duplicate detection
 *   7. Protected EmailJS REST API dispatch
 */
export const sendEmail = async (data: ContactFormData): Promise<ContactResponse> => {
  // 1. HONEYPOT TRAP (Client side early drop)
  // If the hidden honeypot field was filled, a bot filled it.
  // Silently simulate success to deceive the bot while consuming 0 network & 0 quota.
  if (data.company_hp && data.company_hp.trim() !== '') {
    console.warn('[Anti-Spam] Honeypot field triggered. Silently dropping submission.');
    return {
      success: true,
      message: 'Thank you! Your message has been sent successfully.',
    };
  }

  // 2. Client-side input validation
  const validation = validateContactInput(data);
  if (!validation.valid) {
    return {
      success: false,
      message: validation.error || 'Please check the form fields and try again.',
    };
  }

  // 3. Dispatch to secure serverless endpoint
  try {
    const response = await fetch('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: data.name.trim(),
        email: data.email.trim(),
        subject: data.subject?.trim() || '',
        message: data.message.trim(),
        company_hp: data.company_hp || '',
        turnstileToken: data.turnstileToken || '',
      }),
    });

    const responseData = await response.json().catch(() => null);

    if (response.ok && responseData?.success) {
      return {
        success: true,
        message: responseData.message || 'Thank you! Your message has been sent successfully.',
      };
    }

    // Handle rate-limiting (429) or validation / bot error (400)
    const errorMessage =
      responseData?.message ||
      (response.status === 429
        ? 'Please wait before sending another message.'
        : 'Unable to deliver message right now. Please try again later.');

    return {
      success: false,
      message: errorMessage,
    };
  } catch (error) {
    console.error('Network error during contact submission:', error);
    return {
      success: false,
      message: 'Network error. Please check your connection or email directly at amanmishra7774@gmail.com.',
    };
  }
};
