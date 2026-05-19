import { Suspense } from "react";
import Image from "next/image";
import { RegistrationForm } from "@/components/RegistrationForm";
import { StickyCta } from "@/components/StickyCta";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getSettings, getFaqs } from "@/lib/db";
import SeoJsonLd from "@/components/SeoJsonLd";

export const dynamic = 'force-dynamic';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://careersuccess.analytixlabs.co.in';

export default function MasterclassLandingPage() {
  const settings = getSettings();
  const faqs = getFaqs();
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden pb-[88px]">
      <SeoJsonLd siteUrl={SITE_URL} speaker={settings} faqs={faqs} />
      {/* Navbar */}
      <header className="w-full border-b border-slate-200 backdrop-blur-sm bg-white/90 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/ALabs_Masterclass.svg"
              alt="AnalytixLabs Masterclass"
              width={162}
              height={48}
              priority
              className="h-10 md:h-12 w-auto"
            />
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-xs font-bold text-[#003368] uppercase tracking-wider">
              <a href="#learn" className="hover:text-[#00DF83] transition-colors">What You'll Learn</a>
              <a href="#agenda" className="hover:text-[#00DF83] transition-colors">Agenda</a>
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
                <div className="text-xl font-bold text-[#003368]">4.9<span className="text-[#F5B400] ml-0.5">★</span></div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Average Rating</div>
              </div>

              <div className="bg-white border border-slate-100 rounded-lg p-3 shadow-sm">
                <div className="text-xl font-bold text-[#003368]">100%</div>
                <div className="text-[10px] text-slate-500 mt-0.5 font-semibold">Live Training</div>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-3 font-normal italic">
              Stats as of Q1 2026, per AnalytixLabs internal enrollment data.
            </p>

            {/* Trusted By */}
            <div className="mt-8">
              <p className="text-[10px] text-slate-400 mb-4 uppercase tracking-[0.3em] font-semibold">
                In Partnership With
              </p>

              <div className="relative h-36 w-full max-w-2xl">
                <Image 
                  src="/brand/Final_logo.png"
                  alt="AnalytixLabs alumni placed at Google, Amazon, Deloitte, Accenture and other top companies"
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

      {/* Definition Section — Data Analyst vs Data Scientist (AI extractable) */}
      <section id="roles" className="bg-white border-b border-slate-100 py-10 md:py-14">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00DF83]">Quick Primer</p>
            <h2 className="text-2xl md:text-3xl font-bold text-[#003368] mt-1 tracking-tight">
              Data Analyst vs Data Scientist — what's the difference?
            </h2>
            <p className="text-slate-500 max-w-3xl mx-auto mt-3 text-base leading-relaxed font-normal">
              A <strong className="text-[#003368]">Data Analyst</strong> focuses on querying, visualizing, and reporting on existing data using Excel, SQL, and BI tools like Power BI or Tableau. A <strong className="text-[#003368]">Data Scientist</strong> extends this work with statistical modeling and machine learning in Python to make predictions about future outcomes. In 2026, both roles increasingly use AI co-pilots to accelerate their work.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-[#003368] bg-white border border-slate-200 rounded-full px-3 py-1">Data Analyst</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <li>• Excel, SQL, Power BI / Tableau, Python (basics)</li>
                <li>• Describes the past — dashboards, KPIs, reports</li>
                <li>• Typical India salary: ₹4–8 LPA (entry), ₹10–18 LPA (3–5 yrs)</li>
                <li>• Foundation skill: SQL fluency + clear data storytelling</li>
              </ul>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-xs font-bold uppercase tracking-widest text-white bg-[#003368] rounded-full px-3 py-1">Data Scientist</span>
              </div>
              <ul className="space-y-2 text-sm text-slate-600 leading-relaxed">
                <li>• Python, ML libraries, statistics, SQL, MLOps basics</li>
                <li>• Predicts the future — models, forecasts, recommendations</li>
                <li>• Typical India salary: ₹6–12 LPA (entry), ₹14–25 LPA (3–5 yrs)</li>
                <li>• Foundation skill: Python + statistical reasoning + ML fundamentals</li>
              </ul>
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
              icon: '✦',
              accent: 'gold' as const
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
          ].map((item, index) => {
            const isGold = 'accent' in item && item.accent === 'gold';
            const iconClasses = isGold
              ? 'text-[#F5B400] bg-[#F5B400]/10 group-hover:bg-[#F5B400] group-hover:text-[#003368]'
              : 'text-[#00DF83] bg-[#00DF83]/10 group-hover:bg-[#00DF83] group-hover:text-[#003368]';
            return (
              <div
                key={index}
                className="group bg-white border border-slate-100 rounded-xl p-6 hover:border-[#00DF83]/30 hover:shadow-lg hover:shadow-[#003368]/5 hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-xl mb-4 transition-colors duration-300 ${iconClasses}`}>
                  {item.icon}
                </div>

                <h3 className="text-lg font-bold mb-2 tracking-tight text-[#003368]">{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed font-normal">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Inside the Session Section */}
      <section id="agenda" className="max-w-5xl mx-auto px-6 py-12 md:py-20">
        <div className="text-center mb-10 md:mb-14">
          <div className="inline-flex items-center gap-2 bg-[#003368] text-[#00DF83] font-bold rounded-full px-3 py-1 text-[10px] mb-4 uppercase tracking-widest shadow-md shadow-[#003368]/15">
            Inside the Session
          </div>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 tracking-tight text-[#003368]">
            From Excel to AI — Inside the Data Analyst & <span className="text-[#00DF83]">Data Scientist</span> Workflow in 2026
          </h2>
          <p className="text-slate-500 max-w-2xl mx-auto text-base leading-relaxed font-normal">
            One business question. One dataset. Four tools in increasing order of leverage — Excel, SQL, Python, and AI. Watch the fork between the analyst and scientist roles unfold in real time.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 mt-7">
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs font-semibold text-[#003368]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00DF83]"></span>
              90 minutes
            </div>
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs font-semibold text-[#003368]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00DF83]"></span>
              Live on Zoom Webinar
            </div>
            <div className="inline-flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-1.5 text-xs font-semibold text-[#003368]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#00DF83]"></span>
              Freshers & working professionals
            </div>
          </div>
        </div>

        {/* Session Objectives */}
        <div className="mb-12 md:mb-16">
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00DF83]">By the end of this session</p>
            <h3 className="text-xl md:text-2xl font-bold text-[#003368] mt-1">You will clearly understand</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-5 max-w-4xl mx-auto">
            {[
              {
                num: '01',
                title: 'What the work actually looks like',
                desc: 'The day-to-day reality of an analyst and a data scientist in 2026 — tools, tasks, and the questions they answer.'
              },
              {
                num: '02',
                title: 'Which path fits you best',
                desc: 'A clear, six-month roadmap tailored to your background, so you leave with a specific plan — not just inspiration.'
              }
            ].map((obj, i) => (
              <div key={i} className="relative bg-white border border-slate-100 rounded-2xl p-6 hover:border-[#00DF83]/30 hover:shadow-lg hover:shadow-[#003368]/5 transition-all duration-300">
                <div className="text-3xl font-bold text-[#00DF83]/30 mb-2">{obj.num}</div>
                <h4 className="text-base font-bold text-[#003368] mb-2 tracking-tight">{obj.title}</h4>
                <p className="text-sm text-slate-500 leading-relaxed font-normal">{obj.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Topic Blocks Timeline */}
        <div>
          <div className="text-center mb-8">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[#00DF83]">What we'll cover</p>
            <h3 className="text-xl md:text-2xl font-bold text-[#003368] mt-1">The 90-minute walkthrough</h3>
          </div>

          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-[19px] md:left-[23px] top-3 bottom-3 w-px bg-slate-200" aria-hidden="true"></div>

            <ol className="space-y-5">
              {[
                {
                  title: 'The 2026 Data Career Landscape',
                  desc: 'Why "data" isn\'t just one job anymore. The split between Data Analyst and Data Scientist paths, new hiring trends, and how GenAI is widening this gap.'
                },
                {
                  title: 'Excel as Foundation',
                  desc: 'Why Excel is still the starting point — and the three signals that you\'ve outgrown it.'
                },
                {
                  title: 'SQL as the Analyst\'s Core',
                  desc: 'The SQL constructs that cover 80% of real analyst work, and how they connect to BI tools like Power BI and Tableau.'
                },
                {
                  title: 'Python as the Bridge',
                  desc: 'Moving from describing data to predicting it. This is where the analyst path extends into data science.'
                },
                {
                  title: 'AI and GenAI in the Workflow',
                  desc: 'Using AI as a co-pilot for SQL and Python. What "AI-fluent" actually means on a resume today.'
                },
                {
                  title: 'The Fork: Analyst vs. Scientist',
                  desc: 'A direct comparison of salary bands, tools, and daily life — including a six-month roadmap for each.'
                },
                {
                  title: 'Live Q&A',
                  desc: 'Your specific career questions, answered live — bring your background and we\'ll map your next steps.'
                },
                {
                  title: 'Program Walkthrough',
                  desc: 'Introduction to our Data Analytics with AI and Full Stack AI / Data Science tracks. Outcome-backed results: ₹6L minimum CTC, with a 50% refund policy if not placed within six months.',
                  highlight: true
                }
              ].map((block, i) => (
                <li key={i} className="relative pl-14 md:pl-16">
                  <div className={`absolute left-0 top-0 h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center text-sm font-bold ${block.highlight ? 'bg-[#003368] text-[#00DF83] shadow-lg shadow-[#003368]/20' : 'bg-white border-2 border-[#00DF83]/30 text-[#003368]'}`}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div className={`rounded-xl p-5 border transition-all duration-300 ${block.highlight ? 'bg-[#003368] border-[#003368] text-white' : 'bg-white border-slate-100 hover:border-[#00DF83]/30 hover:shadow-md hover:shadow-[#003368]/5'}`}>
                    <h4 className={`text-base font-bold mb-1.5 tracking-tight ${block.highlight ? 'text-white' : 'text-[#003368]'}`}>
                      {block.title}
                    </h4>
                    <p className={`text-sm leading-relaxed font-normal ${block.highlight ? 'text-white/80' : 'text-slate-500'}`}>
                      {block.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="text-center mt-10">
            <a href="#register" className="inline-flex items-center gap-2 bg-[#00DF83] text-[#003368] px-6 py-3 rounded-lg text-sm font-bold hover:bg-[#00c574] transition-all shadow-lg shadow-[#00DF83]/20">
              Save My Spot for the Live Session <span>→</span>
            </a>
          </div>
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
          {faqs.map((faq) => (
            <AccordionItem key={faq.id} value={faq.id} className="bg-white border border-slate-100 rounded-xl px-5 py-1 shadow-sm hover:border-[#00DF83]/20 transition-colors">
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
            src="/brand/ALabs_Masterclass.svg"
            alt="AnalytixLabs Masterclass"
            width={135}
            height={40}
            className="h-10 w-auto opacity-80 mb-10"
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

      <StickyCta />
    </div>
  );
}
