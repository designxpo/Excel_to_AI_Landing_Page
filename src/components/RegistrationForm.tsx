"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, ArrowLeft } from "lucide-react";

export function RegistrationForm() {
  const searchParams = useSearchParams();
  const [utmParams, setUtmParams] = useState({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_term: "",
    utm_content: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otp, setOtp] = useState("");
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    setUtmParams({
      utm_source: searchParams.get("utm_source") || "",
      utm_medium: searchParams.get("utm_medium") || "",
      utm_campaign: searchParams.get("utm_campaign") || "",
      utm_term: searchParams.get("utm_term") || "",
      utm_content: searchParams.get("utm_content") || "",
    });
  }, [searchParams]);

  const handleInitialSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formDataObj = new FormData(e.currentTarget);
    const data = Object.fromEntries(formDataObj.entries());
    setFormData(data);

    // Simulate API call to send OTP
    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    setIsOtpStep(true);
  };

  const handleOtpSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, ...utmParams, otp })
      });
      
      if (!res.ok) throw new Error('Failed to register');

      // Fire Meta Pixel events
      if (typeof window !== "undefined" && (window as any).fbq) {
        (window as any).fbq("track", "Lead");
        (window as any).fbq("trackCustom", "MasterclassRegistered", { topic: "excel_to_ai" });
      }

      setIsSuccess(true);
    } catch (error) {
      console.error(error);
      alert('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="bg-[#00DF83]/10 text-[#003368] p-4 rounded-lg text-center border border-[#00DF83]/30">
        <h3 className="text-lg font-bold mb-2">Registration Confirmed!</h3>
        <p className="text-sm leading-relaxed font-normal">Check your email for the Zoom link. We can't wait to see you there!</p>
      </div>
    );
  }

  if (isOtpStep) {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-4 text-left">
        <div>
          <button 
            type="button" 
            onClick={() => setIsOtpStep(false)}
            className="text-[10px] text-slate-500 hover:text-[#003368] flex items-center gap-1 mb-4 font-semibold transition-colors"
          >
            <ArrowLeft className="w-3 h-3" /> Back
          </button>
          
          <h3 className="text-sm font-bold text-[#003368] mb-2">Verify your phone number</h3>
          <p className="text-[10px] text-slate-500 mb-4 font-normal">
            We've sent a one-time password to {formData?.phone}. Please enter it below.
          </p>
          
          <label className="block text-[10px] font-semibold mb-1 text-[#003368]">Enter OTP</label>
          <input
            type="text"
            required
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            className="w-full border border-gray-200 rounded-lg px-3 py-3 text-sm outline-none focus:ring-1 focus:ring-[#00DF83] transition-all bg-gray-50/50 text-center tracking-[0.5em] font-mono"
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading || otp.length < 4}
          className="w-full bg-[#00DF83] hover:bg-[#00c574] text-[#003368] font-bold py-3 rounded-lg text-sm transition-all shadow-md shadow-[#00DF83]/15 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {isLoading ? (
            <><Loader2 className="h-5 w-5 animate-spin" /> Verifying...</>
          ) : (
            <>Verify & Complete Registration</>
          )}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleInitialSubmit} className="space-y-3 text-left">
      <div>
        <label className="block text-[10px] font-semibold mb-1 text-[#003368]">Full Name</label>
        <input
          type="text"
          name="fullName"
          required
          defaultValue={formData?.fullName || ""}
          placeholder="Enter your full name"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#00DF83] transition-all bg-gray-50/50"
        />
      </div>

      <div>
        <label className="block text-[10px] font-semibold mb-1 text-[#003368]">Email Address</label>
        <input
          type="email"
          name="email"
          required
          defaultValue={formData?.email || ""}
          placeholder="you@example.com"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#00DF83] transition-all bg-gray-50/50"
        />
        <p className="text-[10px] text-gray-400 mt-0.5 font-normal italic">Use the email registered with your Zoom account.</p>
      </div>

      <div>
        <label className="block text-[10px] font-semibold mb-1 text-[#003368]">Phone Number</label>
        <input
          type="tel"
          name="phone"
          required
          pattern="[0-9]{10,12}"
          defaultValue={formData?.phone || ""}
          placeholder="10-digit mobile number"
          className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-[#00DF83] transition-all bg-gray-50/50"
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-semibold mb-1 text-[#003368]">Current Status</label>
          <select 
            name="status"
            required
            defaultValue={formData?.status || ""}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#00DF83] transition-all bg-gray-50/50 appearance-none text-xs"
          >
            <option value="">Select</option>
            <option value="Student">Student</option>
            <option value="Working professional">Working professional</option>
            <option value="Career switcher">Career switcher</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold mb-1 text-[#003368]">City</label>
          <input
            type="text"
            name="city"
            defaultValue={formData?.city || ""}
            placeholder="Your city"
            className="w-full border border-gray-200 rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-[#00DF83] transition-all bg-gray-50/50 text-xs"
          />
        </div>
      </div>

      {/* Hidden inputs for UTM tracking */}
      <input type="hidden" name="utm_source" value={utmParams.utm_source} />
      <input type="hidden" name="utm_medium" value={utmParams.utm_medium} />
      <input type="hidden" name="utm_campaign" value={utmParams.utm_campaign} />
      <input type="hidden" name="utm_term" value={utmParams.utm_term} />
      <input type="hidden" name="utm_content" value={utmParams.utm_content} />

      <button 
        type="submit" 
        disabled={isLoading}
        className="w-full bg-[#00DF83] hover:bg-[#00c574] text-[#003368] font-bold py-3 rounded-lg text-sm transition-all shadow-md shadow-[#00DF83]/15 flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {isLoading ? (
          <><Loader2 className="h-5 w-5 animate-spin" /> Sending OTP...</>
        ) : (
          <>Continue →</>
        )}
      </button>
      
      <p className="text-center text-xs text-gray-400 mt-4 font-normal">
        We'll send an OTP to verify your phone number.
      </p>
    </form>
  );
}
