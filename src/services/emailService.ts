import { ContactFormData, ContactResponse } from '../types';

// Syntax checks are a convenience; ownership is verified by the server magic link.
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

/** Request a verification email. This never delivers the contact message directly. */
export const sendEmail = async (data: ContactFormData): Promise<ContactResponse> => {
  const validation = validateContactInput(data);
  if (!validation.valid) return { success: false, message: validation.error! };
  return contactRequest('request-verification', data);
};

export const resendVerificationEmail = () => contactRequest('resend-verification', {});

export async function contactRequest(action: string, body: unknown): Promise<ContactResponse> {
  try {
    const response = await fetch(`/api/contact/${action}`, {
      method: 'POST', credentials: 'same-origin', signal: AbortSignal.timeout(30000),
      headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => null);
    if (data && typeof data.message === 'string') return { ...data, success: response.ok && data.success === true };
    return { success: false, code: 'unavailable', message: 'The email service is temporarily unavailable. Please try again shortly.' };
  } catch {
    return { success: false, code: 'network_error', message: 'Network error. Please check your connection and try again.' };
  }
}
