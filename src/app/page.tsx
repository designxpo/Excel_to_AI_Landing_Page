import { Suspense } from "react";
import Image from "next/image";
import { RegistrationForm } from "@/components/RegistrationForm";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getSettings } from "@/lib/db";

export const dynamic = 'force-dynamic';

export default function MasterclassLandingPage() {
  const settings = getSettings();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">
      {/* Navbar */}
      <header className="w-full border-b border-slate-200 backdrop-blur-sm bg-white/90 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/brand/alabs-logo.svg" 
              alt="AnalytixLabs" 
              width={180} 
              height={42} 
              priority
              className="h-auto w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#003368] uppercase tracking-wider">
              <a href="#learn" className="hover:text-[#00DF83] transition-colors">What You'll Learn</a>
              <a href="#faq" className="hover:text-[#00DF83] transition-colors">FAQ</a>
            </nav>

            <a href="#register" className="bg-[#00DF83] text-[#003368] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#00c574] transition-all shadow-md shadow-[#00DF83]/20">
              Book Free Session
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-[-150px] right-[-100px] h-[600px] w-[600px] rounded-full bg-[#00DF83]/10 blur-[120px]"></div>
          <div className="absolute bottom-[-120px] left-[-100px] h-[500px] w-[500px] rounded-full bg-[#003368]/5 blur-[120px]"></div>
          
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.05] pointer-events-none">
            <Image 
              src="/brand/background.jpg" 
              alt="" 
              fill 
              priority
              loading="eager"
              className="object-contain"
            />
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-6 py-8 md:py-12 grid lg:grid-cols-2 gap-8 items-center">
          {/* Left Content */}
          <div className="z-10">
            <div className="inline-flex items-center gap-2 bg-[#00DF83]/10 border border-[#00DF83]/20 rounded-full px-4 py-2 text-sm font-semibold text-[#003368] mb-8">
              🚀 Free 90-Minute Live Masterclass • Beginner Friendly
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight tracking-tight mb-5 text-[#003368]">
              From <span className="text-[#00DF83]">Excel to AI</span> —
              <br />
              Inside the Data Analyst & Data Scientist <span className="text-[#00DF83]">Workflow</span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-md mb-6 font-normal">
              Master the high-demand stack of Excel, SQL, Python, and Power BI with AI integration. Learn from the "og" mentors at AnalytixLabs.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-8">
              <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                <div className="text-xl font-bold text-[#003368]">50K+</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Students Trained</div>
              </div>

              <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                <div className="text-xl font-bold text-[#003368]">4.9★</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Average Rating</div>
              </div>

              <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                <div className="text-xl font-bold text-[#003368]">100%</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Live Training</div>
              </div>
            </div>

            {/* Trusted By */}
            <div className="mt-8">
              <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-[0.3em] font-semibold">
                In Partnership With
              </p>

              <div className="relative h-36 w-full max-w-2xl">
                <Image 
                  src="/brand/Final_logo.png" 
                  alt="Alumni placement companies" 
                  fill
                  sizes="(max-width: 768px) 100vw, 768px"
                  className="object-contain object-left transition-all duration-300"
                />
              </div>
            </div>
          </div>

          {/* Right Form Card */}
          <div className="relative z-10" id="register">
            <div className="absolute inset-0 bg-[#00DF83]/5 blur-[100px] rounded-full opacity-50"></div>

            <div className="relative bg-white text-[#003368] rounded-xl p-4 md:p-6 shadow-[0_16px_40px_-8px_rgba(0,51,104,0.08)] border border-slate-100">
              <div className="mb-6">
                <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-bold rounded-full px-2.5 py-1 text-[9px] mb-3 uppercase tracking-wider border border-red-100">
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse"></span>
                  Limited Seats Available
                </div>

                <h2 className="text-xl font-bold leading-tight mb-2 tracking-tight">
                  Register for the Free Masterclass
                </h2>

                <p className="text-xs text-slate-500 leading-relaxed font-normal">
                  Join 15,000+ learners discovering AI-powered analytics workflows.
                </p>
              </div>

              <Suspense fallback={<div className="h-[400px] flex items-center justify-center text-slate-300">Loading form...</div>}>
                <RegistrationForm />
              </Suspense>

              {/* Success metrics */}
              <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between text-center">
                <div>
                  <div className="text-lg font-bold text-[#003368]">4.9/5</div>
                  <div className="text-[8px] uppercase font-semibold tracking-widest text-slate-400 mt-0.5">Reviews</div>
                </div>

                <div className="w-px h-6 bg-slate-100"></div>

                <div>
                  <div className="text-lg font-bold text-[#003368]">50,000+</div>
                  <div className="text-[8px] uppercase font-semibold tracking-widest text-slate-400 mt-0.5">Alumni</div>
                </div>

                <div className="w-px h-6 bg-slate-100"></div>

                <div>
                  <div className="text-lg font-bold text-[#003368]">90 Min</div>
                  <div className="text-[8px] uppercase font-semibold tracking-widest text-slate-400 mt-0.5">Live Session</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="learn" className="max-w-5xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight text-[#003368]">
            What You'll <span className="text-[#00DF83]">Master</span>
          </h2>
          <p className="text-slate-500 max-w-lg mx-auto text-base leading-relaxed font-normal">
            Designed for beginners and professionals who want to build modern AI-powered analytics skills in record time.
          </p>
        </div>

        <div className="relative w-full max-w-4xl mx-auto mb-16 rounded-2xl overflow-hidden shadow-xl shadow-[#003368]/5 border border-slate-100 bg-slate-50/50 p-4 md:p-8">
          <Image 
            src="/brand/landingpageelement.png"
            alt="AI-Powered Analytics Workflow: From Excel to Dashboard"
            width={1200}
            height={800}
            className="w-full h-auto object-contain rounded-lg"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: 'AI-Powered Analytics',
              desc: 'Use ChatGPT, Claude, and automation workflows to generate insights 10x faster.',
              icon: '✦'
            },
            {
              title: 'The Modern Toolkit',
              desc: 'Master the high-ROI intersection of Excel, SQL, Python, and Power BI dashboards.',
              icon: '⚒'
            },
            {
              title: 'Career Roadmap',
              desc: 'Strategic path to transition into Data Analyst and Data Science roles in 2026.',
              icon: '🚀'
            }
          ].map((item, index) => (
            <div
              key={index}
              className="group bg-white border border-slate-100 rounded-xl p-6 hover:border-[#00DF83]/30 hover:shadow-lg hover:shadow-[#003368]/5 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="h-12 w-12 rounded-lg bg-[#00DF83]/10 flex items-center justify-center text-xl mb-4 group-hover:bg-[#00DF83] group-hover:text-[#003368] transition-colors duration-300 text-[#00DF83]">
                {item.icon}
              </div>

              <h3 className="text-lg font-bold mb-2 tracking-tight text-[#003368]">{item.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-normal">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Faculty Section */}
      <section className="bg-slate-100 border-y border-slate-200 py-12 md:py-16">
        <div className="max-w-4xl mx-auto px-6 flex flex-col md:flex-row items-center gap-10 md:gap-16">
          <div className="relative w-40 h-40 md:w-56 md:h-56 shrink-0">
            <div className="absolute inset-0 bg-[#00DF83]/20 blur-2xl rounded-full"></div>
            <div className="relative w-full h-full rounded-2xl overflow-hidden border-2 border-white shadow-lg">
              <Image 
                src={settings.speakerImage} 
                alt={settings.speakerName} 
                fill 
                sizes="(max-width: 768px) 160px, 224px"
                className="object-cover"
              />
            </div>
          </div>
          
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-[#003368] text-[#00DF83] font-bold rounded-full px-3 py-1 text-[10px] mb-4 uppercase tracking-widest shadow-md shadow-[#003368]/15">
              Live Session
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight text-[#003368]">Learn from {settings.speakerName}</h2>
            <p className="text-base text-slate-600 mb-5 leading-relaxed max-w-md font-normal">
              {settings.speakerBio}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center md:justify-start">
               <div className="flex items-center gap-2.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-[#00DF83]"></div>
                  <span className="text-sm font-semibold text-[#003368]">Live Q&A</span>
               </div>
               <div className="flex items-center gap-2.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-[#00DF83]"></div>
                  <span className="text-sm font-semibold text-[#003368]">Hands-on Lab</span>
               </div>
               <div className="flex items-center gap-2.5">
                 <div className="h-1.5 w-1.5 rounded-full bg-[#00DF83]"></div>
                  <span className="text-sm font-semibold text-[#003368]">Certificate</span>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-2xl mx-auto px-6 py-12 md:py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 text-[#003368]">Common Questions</h2>
        </div>

        <Accordion className="space-y-4">
          {[
            { q: 'Is this really free?', a: 'Yes, this is a community-first session with no hidden costs or upsells.' },
            { q: 'Do I need coding experience?', a: 'None required. We start from Excel basics and move into AI tools.' },
            { q: 'Will I get a recording?', a: 'Live attendance is encouraged, but a 48-hour recording link is shared.' },
            { q: 'Is there a certificate?', a: 'Yes, all live attendees get a Masterclass Completion certificate.' }
          ].map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="bg-white border border-slate-100 rounded-xl px-5 py-1 shadow-sm hover:border-[#00DF83]/20 transition-colors">
              <AccordionTrigger className="text-base font-semibold hover:no-underline text-left text-[#003368]">{faq.q}</AccordionTrigger>
              <AccordionContent className="text-slate-500 text-sm leading-relaxed pt-1 pb-3 font-normal">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <Image 
            src="/brand/alabs-logo.svg" 
            alt="AnalytixLabs" 
            width={140} 
            height={32} 
            className="h-8 w-auto opacity-80 mb-10"
          />
          
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-4 text-sm font-semibold text-slate-400 uppercase tracking-widest mb-10">
             <a href="#" className="hover:text-[#00DF83] transition-colors">Privacy</a>
             <a href="#" className="hover:text-[#00DF83] transition-colors">Terms</a>
             <a href="#" className="hover:text-[#00DF83] transition-colors">Contact</a>
             <a href="#" className="hover:text-[#00DF83] transition-colors">Help</a>
          </div>

          <p className="text-slate-400 text-sm font-normal">
            © {new Date().getFullYear()} AnalytixLabs India. Global Headquarters: Gurgaon, India.
          </p>
        </div>
      </footer>
    </div>
  );
}
