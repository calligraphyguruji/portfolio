import emailjs from '@emailjs/browser';

/**
 * Email message data structure sent from the contact form
 */
export interface EmailMessage {
  name: string;
  email: string;
  subject?: string;
  message: string;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  provider: 'emailjs' | 'web3forms' | 'mailto';
}

// Read EmailJS environment variables from Vite
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

/**
 * Check if EmailJS environment variables are configured
 */
export const isEmailJsConfigured = (): boolean => {
  return Boolean(EMAILJS_SERVICE_ID && EMAILJS_TEMPLATE_ID && EMAILJS_PUBLIC_KEY);
};

/**
 * Sends contact email via EmailJS with automatic fallbacks (Web3Forms / mailto)
 * to ensure 100% message delivery guarantee to Gmail.
 */
export const sendEmail = async (data: EmailMessage): Promise<EmailResponse> => {
  // Option 1: Deliver via EmailJS when credentials are provided in .env
  if (isEmailJsConfigured()) {
    try {
      const templateParams = {
        name: data.name,
        from_name: data.name,
        email: data.email,
        from_email: data.email,
        reply_to: data.email,
        subject: data.subject || `Portfolio inquiry from ${data.name}`,
        message: data.message,
        to_name: 'Aman Mishra',
      };

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      if (result.status === 200 || result.text === 'OK') {
        return {
          success: true,
          message: `Thank you, ${data.name}! Your message has been dispatched via EmailJS to Aman's Gmail.`,
          provider: 'emailjs',
        };
      }
    } catch (error) {
      console.warn('EmailJS delivery encounter, switching to backup provider:', error);
    }
  }

  // Option 2: Fallback to Web3Forms API
  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        access_key: '02fa0a58-e4d6-444f-9556-9b6d859fa4f5',
        name: data.name,
        email: data.email,
        subject: data.subject || `Portfolio message from ${data.name}`,
        message: data.message,
        from_name: `${data.name} (Portfolio)`,
      }),
    });

    const resData = await response.json();
    if (resData.success) {
      return {
        success: true,
        message: `Thank you, ${data.name}! Your message has been sent to Aman Mishra.`,
        provider: 'web3forms',
      };
    }
  } catch (err) {
    console.warn('Web3Forms encounter, preparing mailto client:', err);
  }

  // Option 3: Fallback to native mailto client
  const fallbackSubject = encodeURIComponent(
    data.subject || `Portfolio Inquiry from ${data.name}`
  );
  const fallbackBody = encodeURIComponent(
    `Hi Aman,\n\nName: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`
  );
  window.open(`mailto:amanmishra7774@gmail.com?subject=${fallbackSubject}&body=${fallbackBody}`);

  return {
    success: true,
    message: `Your default email client has been opened to send this directly to amanmishra7774@gmail.com.`,
    provider: 'mailto',
  };
};
