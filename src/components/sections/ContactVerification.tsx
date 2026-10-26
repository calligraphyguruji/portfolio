import { useEffect, useRef, useState } from 'react';
import { contactRequest } from '../../services/emailService';
import { PageSEO } from '../common/PageSEO';
import type { ContactResponse } from '../../types';

export function ContactVerification() {
  const token = useRef(new URLSearchParams(window.location.hash.slice(1)).get('token') || '');
  const [result, setResult] = useState<ContactResponse | null>(() => window.history.state?.contactVerification || null);
  const [busy, setBusy] = useState(false);
  const started = useRef(false);
  const verify = async () => {
    setBusy(true);
    const response = await contactRequest('verify', { token: token.current });
    setResult(response);
    if (['accepted', 'used', 'pending', 'delivery_failed'].includes(response.code || '')) window.history.replaceState({ contactVerification: response }, '', '/contact/verify');
    setBusy(false);
  };
  useEffect(() => {
    // Strip the bearer token before analytics/navigation; keep it only in this component's memory.
    window.history.replaceState(window.history.state, '', '/contact/verify');
    if (started.current) return;
    started.current = true;
    if (!result) void verify();
  }, []);
  const retryable = token.current && result && ['pending', 'unavailable', 'network_error'].includes(result.code || '');
  return (
    <>
    <PageSEO title="Email Verification | Aman Mishra" noindex canonical="https://calligraphyguruji.dev/contact/verify" />
    <section className="max-w-6xl mx-auto px-4 sm:px-8 py-10 w-full">
      <div className="editorial-panel p-8 sm:p-14 lg:p-20 text-center">
        <div className="max-w-xl mx-auto space-y-6">
          <h1 className="text-3xl sm:text-4xl font-sans font-extrabold uppercase tracking-tight text-[#171717] dark:text-white">
            {busy ? 'Verifying your email…' : result?.code === 'accepted' ? '✅ Email Verified Successfully!' : result?.code === 'used' ? 'Email Already Verified' : result?.code === 'pending' ? 'Email Verified — Delivery Pending' : 'Email Verification'}
          </h1>
          <p role="status" aria-live="polite" className="text-sm text-[#5E5E5E] dark:text-slate-300 leading-relaxed">
            {result?.message || 'Please wait while we verify your email and send your message.'}
          </p>
          {result?.code === 'accepted' && <p className="text-xs text-[#5E5E5E] dark:text-slate-300">The email service has accepted your message for delivery.</p>}
          {retryable && <button disabled={busy} onClick={() => void verify()} className="px-6 py-3 rounded-full border border-black/10 dark:border-white/20 text-xs uppercase tracking-wider disabled:opacity-60">Check again / retry</button>}
          {!token.current && result?.code === 'pending' && <p className="text-sm text-[#5E5E5E] dark:text-slate-300">Reopen the link in your verification email to check delivery again.</p>}
          {result?.code === 'expired' && <a href="/contact#contact" className="block text-sm underline">Submit your message again to request a new link</a>}
          <a href="/" className="inline-flex px-8 py-3.5 rounded-full bg-[#171717] text-white dark:bg-white dark:text-[#171717] text-xs font-semibold uppercase tracking-wider">Back to Portfolio</a>
        </div>
      </div>
    </section>
    </>
  );
}
