"use client";

import { useState, useEffect } from "react";
import { Loader2, LogOut, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminPortal() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"settings" | "registrations">("settings");
  
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

  useEffect(() => {
    if (activeTab === "registrations") {
      loadRegistrations();
    }
  }, [activeTab]);

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

        </div>
      </div>
    </div>
  );
}
