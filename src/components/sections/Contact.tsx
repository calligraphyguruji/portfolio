import React, { useState } from 'react';
import { personalInfo } from '../../data/portfolioData';
import { SectionHeading } from '../ui/SectionHeading';
import {
  Mail,
  Linkedin,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Github,
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const Contact: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setStatus('error');
      setStatusMessage('Please fill in all required fields (Name, Email, and Message).');
      return;
    }

    setStatus('loading');

    try {
      // Free Web3Forms endpoint for direct delivery to Gmail with fallback
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          access_key: '02fa0a58-e4d6-444f-9556-9b6d859fa4f5', // Web3Forms public access token
          name: formData.name,
          email: formData.email,
          subject: formData.subject || `Portfolio Inquiry from ${formData.name}`,
          message: formData.message,
          to_email: personalInfo.socials.email,
          from_name: `${formData.name} (Portfolio Contact)`,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setStatus('success');
        setStatusMessage(
          `Thank you, ${formData.name}! Your message has been sent directly to ${personalInfo.socials.email}. I will get back to you shortly.`
        );
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        // Fallback: Open mailto client directly so communication is never blocked
        triggerMailtoFallback();
      }
    } catch {
      // Network or API blocked: Fallback to mailto
      triggerMailtoFallback();
    }
  };

  const triggerMailtoFallback = () => {
    const subject = encodeURIComponent(
      formData.subject || `Portfolio Inquiry from ${formData.name}`
    );
    const body = encodeURIComponent(
      `Hi Aman,\n\nName: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
    );
    window.open(`mailto:${personalInfo.socials.email}?subject=${subject}&body=${body}`);

    setStatus('success');
    setStatusMessage(
      `Your email client has been prepared to send your message to ${personalInfo.socials.email}. Thank you for reaching out!`
    );
  };

  return (
    <section id="contact" className="py-14 sm:py-20 px-5 sm:px-8 max-w-6xl mx-auto">
      {/* Section Divider & Header */}
      <SectionHeading
        eyebrow="07 // Direct Dispatch"
        title="Let's Create Something Amazing!"
        number="07"
        description="Have a project in mind? Let's discuss how we can work together to bring your ideas to life."
        align="center"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
        {/* Left Column: "Get in Touch" (Matching Reference Screenshot) */}
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-xl sm:text-2xl font-sans font-medium text-[#171717] dark:text-white">
            Get in Touch
          </h3>

          <div className="rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] p-6 sm:p-7 space-y-6 shadow-xs">
            {/* Email item */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/40 shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F] dark:text-slate-400 block">
                  Email
                </span>
                <a
                  href={`mailto:${personalInfo.socials.email}`}
                  className="text-sm font-medium text-[#171717] dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                >
                  {personalInfo.socials.email}
                </a>
              </div>
            </div>

            {/* GitHub item */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/40 shrink-0">
                <Github className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F] dark:text-slate-400 block">
                  GitHub
                </span>
                <a
                  href={personalInfo.socials.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#171717] dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                >
                  github.com/calligraphyguruji
                </a>
              </div>
            </div>

            {/* LinkedIn item */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/40 shrink-0">
                <Linkedin className="w-5 h-5" />
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F] dark:text-slate-400 block">
                  LinkedIn
                </span>
                <a
                  href={personalInfo.socials.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[#171717] dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors block truncate"
                >
                  linkedin.com/in/calligraphygurji
                </a>
              </div>
            </div>

            {/* Location item */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/40 shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F] dark:text-slate-400 block">
                  Location
                </span>
                <span className="text-sm font-medium text-[#171717] dark:text-white block">
                  {personalInfo.location}
                </span>
              </div>
            </div>

            {/* Working Hours / Availability item */}
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/40 shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-[#6F6F6F] dark:text-slate-400 block">
                  Working Hours
                </span>
                <span className="text-sm font-medium text-[#171717] dark:text-white block">
                  Mon &ndash; Fri, 9:00 &ndash; 18:00 (IST)
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: "Send a Message" Form (Matching Reference Screenshot) */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="text-xl sm:text-2xl font-sans font-medium text-[#171717] dark:text-white">
            Send a Message
          </h3>

          <div className="rounded-[20px] bg-white dark:bg-[#121722] border border-[#E5E7EB] dark:border-[#262626] p-6 sm:p-8 shadow-xs">
            {status === 'success' ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-medium text-[#171717] dark:text-white">
                  Message Sent!
                </h4>
                <p className="text-sm text-[#5E5E5E] dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  {statusMessage}
                </p>
                <button
                  onClick={() => setStatus('idle')}
                  className="mt-2 px-6 py-2.5 rounded-xl bg-[#171717] text-white hover:bg-[#222222] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                {status === 'error' && (
                  <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{statusMessage}</span>
                  </div>
                )}

                {/* Name field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-[#171717] dark:text-slate-200"
                  >
                    Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-[#262626] bg-white dark:bg-[#161B22] text-[#171717] dark:text-white text-sm placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Email field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-[#171717] dark:text-slate-200"
                  >
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="your.email@example.com"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-[#262626] bg-white dark:bg-[#161B22] text-[#171717] dark:text-white text-sm placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Subject field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-[#171717] dark:text-slate-200"
                  >
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    placeholder="Project inquiry / Opportunity"
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-[#262626] bg-white dark:bg-[#161B22] text-[#171717] dark:text-white text-sm placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
                  />
                </div>

                {/* Message field */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-[#171717] dark:text-slate-200"
                  >
                    Message <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell me about your project, timeline, or open role..."
                    className="w-full px-4 py-3 rounded-xl border border-[#E5E7EB] dark:border-[#262626] bg-white dark:bg-[#161B22] text-[#171717] dark:text-white text-sm placeholder-[#A0A0A0] focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all resize-none"
                  />
                </div>

                {/* Submit button (Matching Screenshot's Vibrant Royal-Blue/Indigo CTA) */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#4F46E5] hover:bg-[#4338CA] dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white font-medium text-sm tracking-wide shadow-md active:scale-[0.99] transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
