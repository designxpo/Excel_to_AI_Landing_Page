"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft, CheckCircle2, Phone, User, Mail, MapPin, Briefcase } from "lucide-react";
import { initBehaviourTracking, getBehaviourSnapshot } from "@/utils/trackBehaviour";

interface RegistrationFormProps {
  typeFilter?: string;
}

export function RegistrationForm({ typeFilter = "ppc_masterclass" }: RegistrationFormProps) {
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [token, setToken] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    status: "",
    city: "",
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
    if (!/^[6-9]\d{9}$/.test(formData.phone)) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const behaviour = getBehaviourSnapshot();
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          ...utmRef.current,
          gclid: gclidRef.current,
          typeFilter,
          behaviour,
          sourceName: "ExcelToAI_Masterclass",
          landingPageUrl: window.location.href,
        }),
      });

      const result = await res.json();
      if (result.success) {
        if (result.fallback) {
          setIsSuccess(true);
          setTimeout(() => {
            window.location.href = `/thankyou-for-registration?email=${encodeURIComponent(formData.email)}`;
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
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, otp_entered: otp, mobile: formData.phone }),
      });

      const result = await res.json();
      if (result.success) {
        setIsSuccess(true);
        // Full page navigation to preserve referer for Cloudflare routing
        setTimeout(() => {
          window.location.href = `/thankyou-for-registration?email=${encodeURIComponent(formData.email)}`;
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
        <h3 className="text-2xl font-bold mb-2">You're Registered!</h3>
        <p className="text-sm">Check your WhatsApp and Email for the Zoom link. We look forward to seeing you there!</p>
      </div>
    );
  }

  if (isOtpStep) {
    return (
      <div className="animate-in slide-in-from-right duration-300">
        <button type="button" onClick={() => setIsOtpStep(false)} className="text-[10px] text-slate-500 mb-6 flex items-center gap-1 font-semibold"><ArrowLeft className="w-3 h-3" /> Edit Details</button>
        <h3 className="text-lg font-bold text-[#003368] mb-1">Verify your number</h3>
        <p className="text-xs text-slate-500 mb-6">We've sent a 4-digit code to {formData.phone} via WhatsApp.</p>
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
            {isLoading ? <Loader2 className="animate-spin mx-auto" /> : "Verify & Complete →"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-4">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><User className="w-3 h-3" /> Full Name</label>
          <input type="text" name="fullName" required value={formData.fullName} onChange={handleInputChange} placeholder="Your name" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Mail className="w-3 h-3" /> Email</label>
          <input type="email" name="email" required value={formData.email} onChange={handleInputChange} placeholder="Email address" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50" />
        </div>
        <div>
          <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Phone className="w-3 h-3" /> WhatsApp Number</label>
          <input type="tel" name="phone" required maxLength={10} value={formData.phone} onChange={handleInputChange} placeholder="10-digit number" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><Briefcase className="w-3 h-3" /> Status</label>
            <select name="status" required value={formData.status} onChange={handleInputChange} className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50 appearance-none">
              <option value="">Select</option>
              <option value="Student">Student</option>
              <option value="Working professional">Working professional</option>
              <option value="Career switcher">Career switcher</option>
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-slate-400 mb-1 flex items-center gap-1.5"><MapPin className="w-3 h-3" /> City</label>
            <input type="text" name="city" required value={formData.city} onChange={handleInputChange} placeholder="City" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50/50" />
          </div>
        </div>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button type="submit" disabled={isLoading} className="w-full bg-[#00DF83] text-[#003368] font-bold py-4 rounded-xl shadow-lg shadow-[#00DF83]/20 mt-4 group">
        {isLoading ? <Loader2 className="animate-spin mx-auto" /> : <>Register Now <span className="inline-block group-hover:translate-x-1 transition-transform">→</span></>}
      </button>
      <p className="text-center text-[10px] text-gray-400 uppercase tracking-widest mt-4">Instant OTP via WhatsApp</p>
    </form>
  );
}
