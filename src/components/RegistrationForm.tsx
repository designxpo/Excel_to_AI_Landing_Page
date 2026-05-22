"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, Phone, User, Mail, MapPin, Briefcase, Megaphone } from "lucide-react";
import { initBehaviourTracking, getBehaviourSnapshot } from "@/utils/trackBehaviour";
import { INDIAN_CITIES, isValidCity } from "@/lib/indian-cities";
import { validateName, validateEmail, validatePhone, normalizeEmail, normalizePhone } from "@/lib/form-validation";

export interface RegistrationFormCopy {
  labelName?: string | null;
  labelEmail?: string | null;
  labelPhone?: string | null;
  labelStatus?: string | null;
  labelCity?: string | null;
  labelReferral?: string | null;
  placeholderName?: string | null;
  placeholderEmail?: string | null;
  placeholderPhone?: string | null;
  placeholderSelect?: string | null;
  placeholderCity?: string | null;
  statusOptions?: string | null;      // newline-separated
  referralOptions?: string | null;    // newline-separated
  ctaButtonText?: string | null;
  otpFooterLabel?: string | null;
  otpHeading?: string | null;
  otpSubtitleTemplate?: string | null;
  otpEditDetailsLabel?: string | null;
  otpVerifyButtonText?: string | null;
  successHeading?: string | null;
  successBody?: string | null;
}

interface RegistrationFormProps {
  typeFilter?: string;
  copy?: RegistrationFormCopy;
}

function parseOptions(text: string | null | undefined, fallback: string[]): string[] {
  if (!text) return fallback;
  const lines = text.split('\n').map(s => s.trim()).filter(Boolean);
  return lines.length ? lines : fallback;
}

function readCookie(name: string): string | undefined {
  if (typeof document === 'undefined') return undefined;
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/[-.+*]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : undefined;
}

function newEventId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export function RegistrationForm({ typeFilter = "PPC-SM", copy = {} }: RegistrationFormProps) {
  // Resolve copy with hardcoded fallbacks matching the original page.
  const labelName     = copy.labelName     ?? 'Full Name';
  const labelEmail    = copy.labelEmail    ?? 'Email';
  const labelPhone    = copy.labelPhone    ?? 'WhatsApp Number';
  const labelStatus   = copy.labelStatus   ?? 'Status';
  const labelCity     = copy.labelCity     ?? 'City';
  const labelReferral = copy.labelReferral ?? 'How did you hear about this masterclass?';
  const phName        = copy.placeholderName   ?? 'Your name';
  const phEmail       = copy.placeholderEmail  ?? 'Email address';
  const phPhone       = copy.placeholderPhone  ?? '10-digit number';
  const phSelect      = copy.placeholderSelect ?? 'Select';
  const phCity        = copy.placeholderCity   ?? 'City';
  const statusOptions   = parseOptions(copy.statusOptions,   ['Student', 'Working professional', 'Career switcher']);
  const referralOptions = parseOptions(copy.referralOptions, ['Counselor', 'Social Media', 'Email Invite', 'WhatsApp Invite', 'Word of Mouth']);
  const submitText     = copy.ctaButtonText        ?? 'Register Now';
  const otpFooterText  = copy.otpFooterLabel       ?? 'Instant OTP via WhatsApp';
  const otpHeading     = copy.otpHeading           ?? 'Verify your number';
  const otpSubtitle    = (copy.otpSubtitleTemplate ?? "We've sent a 4-digit code to {phone} via WhatsApp.");
  const otpEditLabel   = copy.otpEditDetailsLabel  ?? 'Edit Details';
  const otpVerifyText  = copy.otpVerifyButtonText  ?? 'Verify & Complete →';
  const successHeading = copy.successHeading       ?? "You're Registered!";
  const successBody    = copy.successBody          ?? 'Check your WhatsApp and Email for the Zoom link. We look forward to seeing you there!';

  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [token, setToken] = useState("");
  const [zoomJoinUrl, setZoomJoinUrl] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const buildThankYouUrl = (extras: { zoomJoinUrl?: string } = {}) => {
    const params = new URLSearchParams();
    params.set('email', formData.email);
    if (extras.zoomJoinUrl) params.set('zoom_url', extras.zoomJoinUrl);
    return `/thankyou-for-registration?${params.toString()}`;
  };

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "",
    city: "",
    referralSource: "",
  });

  const utmRef = useRef<any>({});
  const gclidRef = useRef<string | null>(null);

  useEffect(() => {
    initBehaviourTracking();
    const params = new URLSearchParams(window.location.search);
    utmRef.current = {
      utm_source: params.get("utm_source") || "direct",
      utm_medium: params.get("utm_medium") || "",
      utm_campaign: params.get("utm_campaign") || "",
      utm_term: params.get("utm_term") || "",
      utm_content: params.get("utm_content") || "",
    };
    const gclid = params.get("gclid") || sessionStorage.getItem("gclid");
    if (gclid) {
      gclidRef.current = gclid;
      sessionStorage.setItem("gclid", gclid);
    }

    // Pre-fill City from Vercel edge geolocation (IP → city, no permission prompt).
    // Only fills if the user hasn't already typed something.
    fetch('/api/geo')
      .then(r => r.json())
      .then((g: { city?: string | null }) => {
        if (g?.city && isValidCity(g.city)) {
          setFormData(prev => prev.city ? prev : { ...prev, city: g.city! });
        }
      })
      .catch(() => { /* silent — fallback is empty field */ });
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError("");
  };

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Per-field validation. First failure wins so the user sees one clear error.
    const nameErr  = validateName(formData.fullName);   if (nameErr)  { setError(nameErr);  return; }
    const emailErr = validateEmail(formData.email);     if (emailErr) { setError(emailErr); return; }
    const phoneErr = validatePhone(formData.phone);     if (phoneErr) { setError(phoneErr); return; }
    if (!formData.status)         { setError('Please select your current status.');   return; }
    if (!isValidCity(formData.city)) {
      setError('Please enter your real city name (letters only, at least 3 characters).');
      return;
    }
    if (!formData.referralSource) { setError('Please tell us how you heard about this masterclass.'); return; }

    // Normalize sanitized values before submit.
    const normalizedName  = formData.fullName.trim().replace(/\s+/g, ' ');
    const normalizedEmail = normalizeEmail(formData.email);
    const normalizedPhone = normalizePhone(formData.phone);
    const normalizedCity  = formData.city.trim().replace(/\s+/g, ' ');
    setFormData(prev => ({
      ...prev,
      fullName: normalizedName,
      email: normalizedEmail,
      phone: normalizedPhone,
      city: normalizedCity,
    }));

    setIsLoading(true);
    setError("");

    try {
      const behaviour = getBehaviourSnapshot();
      const leadEventId = newEventId();
      const fbp = readCookie('_fbp');
      const fbc = readCookie('_fbc');

      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          fullName: normalizedName,
          email: normalizedEmail,
          phone: normalizedPhone,
          city: normalizedCity,
          ...utmRef.current,
          gclid: gclidRef.current,
          typeFilter,
          behaviour,
          sourceName: "ExcelToAI_Masterclass",
          landingPageUrl: window.location.href,
          eventId: leadEventId,
          fbp,
          fbc,
        }),
      });

      const result = await res.json();
      if (result.success) {
        // Fire browser-side Meta Pixel Lead event with same eventID as the server CAPI call.
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
          window.fbq('track', 'Lead', {
            content_name: 'ExcelToAI_Masterclass',
            content_category: typeFilter,
          }, { eventID: leadEventId });
        }

        const incomingZoomUrl: string = result.zoomJoinUrl || "";
        setZoomJoinUrl(incomingZoomUrl);
        if (result.fallback) {
          setIsSuccess(true);
          setTimeout(() => {
            window.location.href = buildThankYouUrl({ zoomJoinUrl: incomingZoomUrl });
          }, 1500);
        } else {
          setToken(result.token);
          setIsOtpStep(true);
          setResendTimer(60);
        }
      } else {
        setError(result.error || "Something went wrong. Please try again.");
      }
    } catch (err) {
      setError("Connection error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 4) return;

    setIsLoading(true);
    setError("");

    try {
      const completeEventId = newEventId();
      const fbp = readCookie('_fbp');
      const fbc = readCookie('_fbc');

      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          otp_entered: otp,
          mobile: formData.phone,
          eventId: completeEventId,
          fbp,
          fbc,
          landingPageUrl: window.location.href,
        }),
      });

      const result = await res.json();
      if (result.success) {
        // Fire browser-side Meta Pixel CompleteRegistration with the same eventID as the server CAPI call.
        if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
          window.fbq('track', 'CompleteRegistration', {
            content_name: 'ExcelToAI_Masterclass',
            content_category: typeFilter,
            status: 'Verified',
          }, { eventID: completeEventId });
        }

        setIsSuccess(true);
        // Prefer the URL returned by /verify (decoded from the signed token).
        // Fall back to the one captured at /send if /verify didn't echo it.
        const finalZoomUrl: string = result.zoomJoinUrl || zoomJoinUrl;
        // Full page navigation to preserve referer for Cloudflare routing
        setTimeout(() => {
          window.location.href = buildThankYouUrl({ zoomJoinUrl: finalZoomUrl });
        }, 1500);
      } else {
        setError(result.error || "Invalid code. Please try again.");
      }
    } catch (err) {
      setError("Verification failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#00DF83]/10 text-[#003368] p-8 rounded-2xl text-center border border-[#00DF83]/30">
        <CheckCircle2 className="w-16 h-16 text-[#00DF83] mx-auto mb-4" />
        <h3 className="text-2xl font-bold mb-2">{successHeading}</h3>
        <p className="text-sm">{successBody}</p>
      </div>
    );
  }

  if (isOtpStep) {
    return (
      <div className="animate-in slide-in-from-right duration-300">
        <button type="button" onClick={() => setIsOtpStep(false)} className="text-[10px] text-slate-500 mb-6 flex items-center gap-1 font-semibold"><ArrowLeft className="w-3 h-3" /> {otpEditLabel}</button>
        <h3 className="text-lg font-bold text-[#003368] mb-1">{otpHeading}</h3>
        <p className="text-xs text-slate-500 mb-6">{otpSubtitle.replace('{phone}', formData.phone)}</p>
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <input
            type="text"
            required
            maxLength={4}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="----"
            className="w-full border border-gray-200 rounded-xl py-4 text-2xl text-center tracking-[1em] font-mono font-bold bg-gray-50 focus:ring-2 focus:ring-[#00DF83] outline-none"
          />
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button type="submit" disabled={isLoading || otp.length < 4} className="w-full bg-[#00DF83] text-[#003368] font-bold py-4 rounded-xl shadow-lg shadow-[#00DF83]/20 disabled:opacity-50">
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : otpVerifyText}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><User className="w-3 h-3" /> {labelName}</label>
          <input
            type="text"
            name="fullName"
            required
            minLength={2}
            maxLength={80}
            pattern="[\p{L} '\-.]{2,80}"
            autoComplete="name"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder={phName}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> {labelEmail}</label>
          <input
            type="email"
            name="email"
            required
            maxLength={254}
            autoComplete="email"
            inputMode="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={phEmail}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50"
          />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> {labelPhone}</label>
          <input
            type="tel"
            name="phone"
            required
            maxLength={10}
            pattern="[6-9][0-9]{9}"
            inputMode="numeric"
            autoComplete="tel-national"
            value={formData.phone}
            onChange={(e) => {
              // Strip non-digits as user types so they can't accidentally enter letters / spaces / +91
              const digits = e.target.value.replace(/\D/g, '').slice(0, 10);
              setFormData(prev => ({ ...prev, phone: digits }));
              if (error) setError("");
            }}
            placeholder={phPhone}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> {labelStatus}</label>
            <select name="status" required value={formData.status} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 appearance-none">
              <option value="">{phSelect}</option>
              {statusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {labelCity}</label>
            <input
              type="text"
              name="city"
              list="lp-cities"
              autoComplete="address-level2"
              required
              minLength={3}
              maxLength={60}
              pattern="[\p{L} '\-.]{3,60}"
              value={formData.city}
              onChange={handleInputChange}
              placeholder={phCity}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50"
            />
            <datalist id="lp-cities">
              {INDIAN_CITIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Megaphone className="w-3 h-3" /> {labelReferral}</label>
          <select name="referralSource" required value={formData.referralSource} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 appearance-none">
            <option value="">{phSelect}</option>
            {referralOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button type="submit" disabled={isLoading} className="w-full bg-[#00DF83] text-[#003368] font-bold py-4 rounded-xl shadow-lg shadow-[#00DF83]/20 mt-4 group">
        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : <>{submitText} <span className="inline-block group-hover:translate-x-1 transition-transform">→</span></>}
      </button>
      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-4">{otpFooterText}</p>
    </form>
  );
}
