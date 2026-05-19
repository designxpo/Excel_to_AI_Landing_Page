"use client";

import { useState, useEffect } from "react";
import { Loader2, LogOut, UploadCloud, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type FaqItem = { id: string; q: string; a: string; order: number };

export default function AdminPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"settings" | "registrations" | "faqs">("settings");
  
  // Settings State
  const [settings, setSettings] = useState({
    speakerName: "",
    speakerTitle: "",
    speakerImage: "",
    speakerBio: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  // Registrations State
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [isLoadingRegs, setIsLoadingRegs] = useState(false);

  // FAQs State
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [isLoadingFaqs, setIsLoadingFaqs] = useState(false);
  const [isSavingFaqs, setIsSavingFaqs] = useState(false);
  const [faqMessage, setFaqMessage] = useState("");

  useEffect(() => {
    // Fetch Settings
    fetch('/api/settings').then(res => res.json()).then(data => setSettings(data));
  }, []);

  const loadRegistrations = () => {
    setIsLoadingRegs(true);
    fetch('/api/register')
      .then(res => res.json())
      .then(data => {
        setRegistrations(data);
        setIsLoadingRegs(false);
      });
  };

  const loadFaqs = () => {
    setIsLoadingFaqs(true);
    fetch('/api/faqs')
      .then(res => res.json())
      .then((data: FaqItem[]) => {
        setFaqs(Array.isArray(data) ? data : []);
        setIsLoadingFaqs(false);
      })
      .catch(() => {
        setFaqMessage("Failed to load FAQs.");
        setIsLoadingFaqs(false);
      });
  };

  useEffect(() => {
    if (activeTab === "registrations") {
      loadRegistrations();
    }
    if (activeTab === "faqs") {
      loadFaqs();
    }
  }, [activeTab]);

  const handleFaqChange = (idx: number, field: 'q' | 'a', value: string) => {
    setFaqs(prev => prev.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  };

  const handleFaqAdd = () => {
    setFaqs(prev => [
      ...prev,
      { id: `new-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, q: '', a: '', order: prev.length }
    ]);
  };

  const handleFaqDelete = (idx: number) => {
    setFaqs(prev => prev.filter((_, i) => i !== idx));
  };

  const handleFaqMove = (idx: number, direction: -1 | 1) => {
    setFaqs(prev => {
      const target = idx + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next.map((f, i) => ({ ...f, order: i }));
    });
  };

  const handleFaqsSave = async () => {
    const invalid = faqs.find(f => !f.q.trim() || !f.a.trim());
    if (invalid) {
      setFaqMessage("Every FAQ must have both a question and an answer.");
      setTimeout(() => setFaqMessage(""), 3000);
      return;
    }
    setIsSavingFaqs(true);
    setFaqMessage("");
    try {
      const payload = faqs.map(({ id, q, a }) => ({ id, q, a }));
      const res = await fetch('/api/faqs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setFaqs(data.faqs);
        setFaqMessage("FAQs saved successfully!");
      } else {
        setFaqMessage(data.error || "Failed to save FAQs.");
      }
    } catch (err) {
      setFaqMessage("Error saving FAQs.");
    }
    setIsSavingFaqs(false);
    setTimeout(() => setFaqMessage(""), 3000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveMessage("");
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        setSaveMessage("Settings saved successfully!");
      } else {
        setSaveMessage("Failed to save.");
      }
    } catch (e) {
      setSaveMessage("Error saving settings.");
    }
    setIsSaving(false);
    setTimeout(() => setSaveMessage(""), 3000);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    setSaveMessage("");

    const formData = new FormData();
    formData.append("file", e.target.files[0]);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        setSettings({ ...settings, speakerImage: data.url });
        setSaveMessage("Image uploaded successfully! (Don't forget to save changes)");
      } else {
        setSaveMessage(data.error || "Failed to upload image.");
      }
    } catch (err) {
      setSaveMessage("Error uploading image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/admin/login');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-8 font-sans">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="border-b border-slate-200 bg-slate-100/50 p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#003368]">Admin Portal</h1>
          <div className="flex items-center gap-4">
            <div className="flex gap-2 bg-slate-200 p-1 rounded-lg">
              <button 
                onClick={() => setActiveTab("settings")}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'settings' ? 'bg-white shadow text-[#003368]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Landing Page Settings
              </button>
              <button
                onClick={() => setActiveTab("registrations")}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'registrations' ? 'bg-white shadow text-[#003368]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Registrations Database
              </button>
              <button
                onClick={() => setActiveTab("faqs")}
                className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${activeTab === 'faqs' ? 'bg-white shadow text-[#003368]' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Common Questions
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          
          {/* Settings Tab */}
          {activeTab === "settings" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold mb-6 text-[#003368]">Speaker Details</h2>
              <form onSubmit={handleSaveSettings} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Speaker Name</label>
                  <input 
                    type="text" 
                    value={settings.speakerName}
                    onChange={e => setSettings({...settings, speakerName: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00DF83]/50 focus:border-[#00DF83]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Speaker Title</label>
                  <input 
                    type="text" 
                    value={settings.speakerTitle}
                    onChange={e => setSettings({...settings, speakerTitle: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00DF83]/50 focus:border-[#00DF83]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Speaker Image</label>
                  <div className="flex items-center gap-4">
                    {settings.speakerImage && (
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-slate-200 shrink-0">
                        <Image src={settings.speakerImage} alt="Preview" fill className="object-cover" />
                      </div>
                    )}
                    <label className={`cursor-pointer flex items-center justify-center gap-2 border border-slate-300 rounded-lg px-4 py-2 text-sm transition-colors ${isUploading ? 'bg-slate-100 text-slate-400' : 'bg-white hover:bg-slate-50 text-slate-700'}`}>
                      {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                      {isUploading ? 'Uploading...' : 'Upload New Image'}
                      <input 
                        type="file" 
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1 text-slate-700">Speaker Bio</label>
                  <textarea 
                    rows={3}
                    value={settings.speakerBio}
                    onChange={e => setSettings({...settings, speakerBio: e.target.value})}
                    className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00DF83]/50 focus:border-[#00DF83]"
                  />
                </div>
                
                <div className="flex items-center gap-4 pt-2">
                  <button 
                    type="submit" 
                    disabled={isSaving}
                    className="bg-[#003368] hover:bg-[#002244] text-white font-bold py-2 px-6 rounded-lg text-sm transition-all flex items-center gap-2"
                  >
                    {isSaving ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving...</> : "Save Changes"}
                  </button>
                  {saveMessage && (
                    <span className={`text-sm font-semibold ${saveMessage.includes('success') ? 'text-[#00DF83]' : 'text-red-500'}`}>
                      {saveMessage}
                    </span>
                  )}
                </div>
              </form>
            </div>
          )}

          {/* Registrations Tab */}
          {activeTab === "registrations" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-[#003368]">Student Registrations</h2>
                <button onClick={loadRegistrations} className="text-sm text-[#003368] font-semibold hover:underline">
                  Refresh Data
                </button>
              </div>

              {isLoadingRegs ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00DF83] animate-spin" /></div>
              ) : registrations.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  No registrations found.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Date</th>
                        <th className="px-6 py-3 font-semibold">Name</th>
                        <th className="px-6 py-3 font-semibold">Email</th>
                        <th className="px-6 py-3 font-semibold">Phone</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                        <th className="px-6 py-3 font-semibold">City</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {registrations.map(reg => (
                        <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4 text-slate-500">{new Date(reg.createdAt).toLocaleString()}</td>
                          <td className="px-6 py-4 font-medium text-[#003368]">{reg.fullName}</td>
                          <td className="px-6 py-4 text-slate-600">{reg.email}</td>
                          <td className="px-6 py-4 text-slate-600">{reg.phone}</td>
                          <td className="px-6 py-4">
                            <span className="bg-[#00DF83]/10 text-[#003368] px-2.5 py-1 rounded-full text-xs font-semibold">
                              {reg.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600">{reg.city || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* FAQs Tab */}
          {activeTab === "faqs" && (
            <div className="max-w-3xl">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#003368]">Common Questions</h2>
                  <p className="text-sm text-slate-500 mt-1">Add, edit, reorder, or delete the FAQs shown on the landing page.</p>
                </div>
                <button
                  onClick={handleFaqAdd}
                  className="flex items-center gap-2 bg-[#00DF83] hover:bg-[#00C975] text-[#003368] font-bold py-2 px-4 rounded-lg text-sm transition-all"
                >
                  <Plus className="w-4 h-4" /> Add FAQ
                </button>
              </div>

              {isLoadingFaqs ? (
                <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 text-[#00DF83] animate-spin" /></div>
              ) : faqs.length === 0 ? (
                <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
                  No FAQs yet. Click "Add FAQ" to create the first one.
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, idx) => (
                    <div key={faq.id} className="bg-white border border-slate-200 rounded-xl p-5">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <span className="text-xs font-semibold text-slate-400 mt-2">#{idx + 1}</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleFaqMove(idx, -1)}
                            disabled={idx === 0}
                            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move up"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFaqMove(idx, 1)}
                            disabled={idx === faqs.length - 1}
                            className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed"
                            title="Move down"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFaqDelete(idx)}
                            className="p-1.5 rounded-md text-red-500 hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600 uppercase tracking-wide">Question</label>
                          <input
                            type="text"
                            value={faq.q}
                            maxLength={300}
                            onChange={e => handleFaqChange(idx, 'q', e.target.value)}
                            placeholder="e.g. Is this really free?"
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00DF83]/50 focus:border-[#00DF83]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1 text-slate-600 uppercase tracking-wide">Answer</label>
                          <textarea
                            rows={3}
                            value={faq.a}
                            maxLength={2000}
                            onChange={e => handleFaqChange(idx, 'a', e.target.value)}
                            placeholder="Answer shown to visitors..."
                            className="w-full border border-slate-300 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#00DF83]/50 focus:border-[#00DF83]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 pt-6 mt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={handleFaqsSave}
                  disabled={isSavingFaqs || isLoadingFaqs}
                  className="bg-[#003368] hover:bg-[#002244] text-white font-bold py-2 px-6 rounded-lg text-sm transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {isSavingFaqs ? <><Loader2 className="w-4 h-4 animate-spin"/> Saving...</> : "Save Changes"}
                </button>
                {faqMessage && (
                  <span className={`text-sm font-semibold ${faqMessage.includes('success') ? 'text-[#00DF83]' : 'text-red-500'}`}>
                    {faqMessage}
                  </span>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
