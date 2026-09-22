import React, { useState } from 'react';
import { personalInfo } from '../../data/portfolioData';
import { sendEmail } from '../../services/emailService';
import {
  ArrowUpRight,
  Github,
  Linkedin,
  Code,
  Youtube,
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export const Contact: React.FC = () => {
  const [showForm, setShowForm] = useState(true);
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
      const response = await sendEmail(formData);

      if (response.success) {
        setStatus('success');
        setStatusMessage(response.message);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        setStatus('error');
        setStatusMessage(response.message || 'Unable to deliver message right now. Please try again.');
      }
    } catch {
      setStatus('error');
      setStatusMessage('An unexpected error occurred. Please contact via amanmishra7774@gmail.com.');
    }
  };

  return (
    <section id="contact" className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
      {/* Editorial Panel matching Screenshot 5 */}
      <div className="editorial-panel p-8 sm:p-14 lg:p-20 text-center relative overflow-hidden">
        {/* Faint Watermark Typography */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 text-7xl sm:text-9xl md:text-[11rem] font-extrabold uppercase tracking-widest text-black/[0.03] dark:text-white/[0.03] select-none pointer-events-none whitespace-nowrap">
          CONNECT
        </div>

        <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
          {/* Centered Availability Status Pill matching Screenshot 5 */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] shadow-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-medium tracking-wider uppercase text-[#171717] dark:text-slate-200">
              Available for New Projects &amp; Internships
            </span>
          </div>

          {/* Giant Editorial Headline matching Screenshot 5 */}
          <h2 className="text-4xl sm:text-6xl md:text-7xl font-sans font-extrabold uppercase tracking-tight text-[#171717] dark:text-white leading-[1.02]">
            HAVE A PROJECT OR OPPORTUNITY IN MIND?
          </h2>

          {/* Supporting Text */}
          <p className="text-sm sm:text-base text-[#5E5E5E] dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-normal">
            Interested in software development, internships, collaborations, or building something useful? Let&apos;s connect.
          </p>

          {/* Primary Action Button */}
          <div className="pt-2">
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-[#171717] text-white hover:bg-[#2A2A2A] dark:bg-white dark:text-[#171717] dark:hover:bg-slate-200 text-xs font-semibold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>{showForm ? 'Write Message Below' : 'Open Message Form'}</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {/* Interactive Message Form (Clean in-page, zero external redirects) */}
          {showForm && (
            <div className="pt-8 max-w-xl mx-auto text-left">
              <div className="p-6 sm:p-8 rounded-3xl bg-black/[0.02] dark:bg-white/[0.03] border border-black/[0.06] dark:border-white/[0.08] shadow-xs">
                {status === 'success' ? (
                  <div className="py-6 text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-lg font-medium text-[#171717] dark:text-white">
                      Message Dispatched!
                    </h4>
                    <p className="text-xs sm:text-sm text-[#5E5E5E] dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                      {statusMessage}
                    </p>
                    <button
                      onClick={() => setStatus('idle')}
                      className="px-5 py-2 rounded-full bg-[#171717] text-white hover:bg-[#2A2A2A] dark:bg-white dark:text-[#171717] text-xs font-medium uppercase tracking-wider transition-all"
                    >
                      Send Another
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {status === 'error' && (
                      <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{statusMessage}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label
                          htmlFor="name"
                          className="block text-xs font-mono uppercase tracking-wider text-[#5E5E5E] dark:text-slate-400"
                        >
                          Name *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your Name"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-[#383838] bg-white dark:bg-[#1E1E1E] text-xs text-[#171717] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                        />
                      </div>

                      <div className="space-y-1">
                        <label
                          htmlFor="email"
                          className="block text-xs font-mono uppercase tracking-wider text-[#5E5E5E] dark:text-slate-400"
                        >
                          Email *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-[#383838] bg-white dark:bg-[#1E1E1E] text-xs text-[#171717] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="subject"
                        className="block text-xs font-mono uppercase tracking-wider text-[#5E5E5E] dark:text-slate-400"
                      >
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        placeholder="Project or Internship Discussion"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-[#383838] bg-white dark:bg-[#1E1E1E] text-xs text-[#171717] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
                      />
                    </div>

                    <div className="space-y-1">
                      <label
                        htmlFor="message"
                        className="block text-xs font-mono uppercase tracking-wider text-[#5E5E5E] dark:text-slate-400"
                      >
                        Message *
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        required
                        rows={3}
                        value={formData.message}
                        onChange={handleChange}
                        placeholder="Tell me about your project, timeline, or open role..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-black/[0.08] dark:border-[#383838] bg-white dark:bg-[#1E1E1E] text-xs text-[#171717] dark:text-white placeholder-[#8E8E93] focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#171717] hover:bg-[#2A2A2A] dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-semibold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-[0.99] disabled:opacity-60 cursor-pointer"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Sending...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Message</span>
                          <Send className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* Bottom Row of Pill Links matching Screenshot 5 */}
          <div className="pt-10 flex flex-wrap items-center justify-center gap-3">
            {/* Avatar Pill */}
            <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#171717] text-white dark:bg-white dark:text-[#171717] shadow-sm">
              <img
                src="/images/potrait.png"
                alt="Aman Mishra"
                className="w-6 h-6 rounded-full object-cover grayscale"
              />
              <span className="text-xs font-medium tracking-wide">Aman Mishra</span>
            </div>

            {/* GitHub Pill */}
            <a
              href={personalInfo.socials.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-white hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Github className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>

            {/* LinkedIn Pill */}
            <a
              href={personalInfo.socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-white hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
              <span>LinkedIn</span>
            </a>

            {/* LeetCode Pill */}
            <a
              href={personalInfo.socials.leetcode}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-white hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Code className="w-3.5 h-3.5 text-amber-500" />
              <span>LeetCode</span>
            </a>

            {/* YouTube Pill */}
            <a
              href={personalInfo.socials.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-white hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
              <span>YouTube</span>
            </a>

            {/* Direct Email Pill */}
            <a
              href={`mailto:${personalInfo.socials.email}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-[#1E1E1E] border border-black/[0.08] dark:border-[#383838] text-xs font-medium text-[#171717] dark:text-white hover:border-black dark:hover:border-white hover:shadow-xs transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>{personalInfo.socials.email}</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
