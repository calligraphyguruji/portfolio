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
}

// Read EmailJS environment variables from Vite
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || '';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || '';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '';

/**
 * Check if EmailJS environment variables are configured in .env
 */
export const isEmailJsConfigured = (): boolean => {
  return Boolean(
    EMAILJS_SERVICE_ID &&
      EMAILJS_TEMPLATE_ID &&
      EMAILJS_PUBLIC_KEY &&
      EMAILJS_SERVICE_ID !== 'your_service_id_here'
  );
};

/**
 * Sends contact email via EmailJS without opening any native mail app or redirecting.
 */
export const sendEmail = async (data: EmailMessage): Promise<EmailResponse> => {
  if (!isEmailJsConfigured()) {
    console.warn(
      'EmailJS is not configured yet. Please add VITE_EMAILJS_SERVICE_ID, VITE_EMAILJS_TEMPLATE_ID, and VITE_EMAILJS_PUBLIC_KEY to your .env file.'
    );
    return {
      success: false,
      message:
        'Email service is not yet configured. Please add your EmailJS keys to the .env file.',
    };
  }

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
        message: `Thank you, ${data.name}! Your message has been sent successfully. I will get back to you soon.`,
      };
    }

    return {
      success: false,
      message: 'Failed to send message via EmailJS. Please try again later.',
    };
  } catch (error: unknown) {
    console.error('EmailJS error:', error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object' && error && 'text' in error
        ? String((error as { text: unknown }).text)
        : 'Failed to send message via EmailJS. Please check your credentials and try again.';

    return {
      success: false,
      message: errorMessage,
    };
  }
};
