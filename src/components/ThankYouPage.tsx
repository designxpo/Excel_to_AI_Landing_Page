// components/ThankYouPage.tsx
'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';

// Per-course brochure env vars. Format: NEXT_PUBLIC_BROCHURE_<SLUG_UPPER_UNDERSCORES>
// e.g. NEXT_PUBLIC_BROCHURE_AGENTIC_AI, NEXT_PUBLIC_BROCHURE_DATA_ANALYTICS
const COURSE_BROCHURE_URLS: Record<string, string | undefined> = {
  'agentic-ai':         process.env.NEXT_PUBLIC_BROCHURE_AGENTIC_AI,
  'data-analytics':     process.env.NEXT_PUBLIC_BROCHURE_DATA_ANALYTICS,
  'data-science':       process.env.NEXT_PUBLIC_BROCHURE_DATA_SCIENCE,
  'business-analytics': process.env.NEXT_PUBLIC_BROCHURE_BUSINESS_ANALYTICS,
  'full-stack-ai':      process.env.NEXT_PUBLIC_BROCHURE_FULL_STACK_AI,
  'data-visualization': process.env.NEXT_PUBLIC_BROCHURE_DATA_VISUALIZATION,
  'data-science-python':process.env.NEXT_PUBLIC_BROCHURE_DATA_SCIENCE_PYTHON,
};

const COURSE_DISPLAY_NAMES: Record<string, string> = {
  'agentic-ai':         'Agentic AI Course',
  'data-analytics':     'Data Analytics Course',
  'data-science':       'Data Science Course',
  'business-analytics': 'Business Analytics Course',
  'full-stack-ai':      'Full Stack Applied AI Course',
  'data-visualization': 'Data Visualization & Analytics',
  'data-science-python':'Data Science With Python',
};

interface ThankYouProps {
  heading: string;
  subCopy: string;
  conversionId?: string;
  verifiedConversionId?: string; // NEW: Primary conversion for OTP verified leads
  isBrochureDownload?: boolean;
}

const WEBINAR_URL = process.env.NEXT_PUBLIC_ZOOM_WEBINAR_URL || 'https://us06web.zoom.us/webinar/register/7517736425815/WN_MwlIZpQCRcmKz_LG4Y3OwQ';
const BROCHURE_PDF_URL = process.env.NEXT_PUBLIC_BROCHURE_URL || 'https://www.analytixlabs.co.in/pdf/Nasscom_(ACDS)_Advanced_Certification_in_Data_Science_Alabs280126.pdf';
const PHONE_NUMBER = '919555525908';
const WA_MESSAGE = encodeURIComponent(
  'Hello, I just submitted my details on the AnalytixLabs website. Can you help me?'
);

const navy = "#09263F";
const teal = "#1DE5B5";

export default function ThankYouPage({ heading, subCopy, conversionId, verifiedConversionId, isBrochureDownload }: ThankYouProps) {
  const searchParams = useSearchParams();
  const rawEmail = searchParams.get('email') || '';
  const rawName = searchParams.get('name') || '';
  const isVerified = searchParams.get('verified') === 'true';
  const courseSlug = searchParams.get('course') || '';
  const personalZoomUrl = (searchParams.get('zoom_url') || '').trim();

  const email = decodeURIComponent(rawEmail);
  const name = decodeURIComponent(rawName);

  const effectiveWebinarUrl = personalZoomUrl || WEBINAR_URL;
  const hasPersonalZoom = personalZoomUrl.length > 0;

  // Resolve per-course brochure URL from env vars if slug is present and known
  const courseBrochureUrl = courseSlug ? COURSE_BROCHURE_URLS[courseSlug] || null : null;
  const courseDisplayName = courseSlug ? COURSE_DISPLAY_NAMES[courseSlug] || '' : '';

  // gtag client-side conversion — PRIMARY signal for Google Ads dashboard + Smart Bidding.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (typeof window.gtag !== 'function') return;

    const firstName = name ? name.split(' ')[0] : '';
    const userData = email ? {
      email,
      ...(firstName && { address: { first_name: firstName } }),
    } : undefined;

    // 1. Always fire existing conversion (Secondary)
    if (conversionId) {
      window.gtag('event', 'conversion', {
        send_to: conversionId,
        ...(userData && { user_data: userData }),
      });
    }

    // 2. Conditionally fire NEW Verified Lead conversion (Primary)
    if (isVerified && verifiedConversionId) {
      window.gtag('event', 'conversion', {
        send_to: verifiedConversionId,
        ...(userData && { user_data: userData }),
      });
    }
  }, [conversionId, verifiedConversionId, email, name, isVerified]);

  return (
    <div style={{ minHeight: '100vh', background: '#f0faf8', paddingBottom: '40px' }}>
      {/* ── HEADER ── */}
      <header style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', justifyContent: 'center' }}>
          <Image
            src="https://careersuccess.analytixlabs.co.in/wp-content/uploads/2025/03/analytixlabs-logo.webp"
            alt="AnalytixLabs"
            width={180}
            height={40}
            style={{ objectFit: 'contain' }}
          />
          <div style={{ width: '1px', height: '30px', background: '#D6ECEB' }} />
          <Image
            src="https://www.analytixlabs.co.in/wp-content/uploads/2026/03/logo-nasscom-ministry.webp"
            alt="NASSCOM"
            width={260}
            height={50}
            style={{ objectFit: 'contain', width: '260px', height: 'auto' }}
          />
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{
          background: 'rgba(255, 255, 255, 0.7)',
          border: '1.5px solid #e0eeeb',
          borderRadius: '24px',
          padding: '60px 40px',
          textAlign: 'center',
          boxShadow: '0 4px 24px rgba(9,38,63,0.05)',
          marginBottom: '40px',
        }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✅</div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 800,
            color: navy,
            marginBottom: '16px',
            fontFamily: 'var(--font-outfit)',
            letterSpacing: '-0.02em'
          }}>
            {heading}
          </h1>

          <p style={{ fontSize: '18px', color: '#4A6275', lineHeight: 1.6, marginBottom: '28px', maxWidth: '800px', margin: '0 auto 28px' }}>
            {subCopy}
          </p>

          {/* User details pill */}
          {email && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              background: '#e8f4fd',
              border: '1px solid #b8ddf7',
              borderRadius: '999px',
              padding: '8px 24px',
              fontSize: '15px',
              color: navy,
              fontWeight: 600,
              marginBottom: isBrochureDownload ? '32px' : '0'
            }}>
              {name && <span style={{ marginRight: '8px' }}>{name} ·</span>}
              <span>Confirmation sent to: {email}</span>
            </div>
          )}

          {/* Brochure Download Button — course-specific if slug matches, else generic */}
          {isBrochureDownload && (
            <div style={{ marginTop: '20px' }}>
              {courseBrochureUrl ? (
                <a href={courseBrochureUrl} target="_blank" rel="noopener noreferrer"
                  style={{
                    background: teal,
                    color: navy,
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '16px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    boxShadow: '0 8px 30px rgba(29,229,181,0.3)',
                    transition: 'all 0.2f'
                  }}>
                  ⬇ Download {courseDisplayName} Brochure
                </a>
              ) : !courseSlug ? (
                <a href={BROCHURE_PDF_URL} target="_blank" rel="noopener noreferrer"
                  style={{
                    background: teal,
                    color: navy,
                    padding: '16px 32px',
                    borderRadius: '12px',
                    fontWeight: 700,
                    fontSize: '16px',
                    textDecoration: 'none',
                    display: 'inline-block',
                    boxShadow: '0 8px 30px rgba(29,229,181,0.3)',
                    transition: 'all 0.2s'
                  }}>
                  Download File now
                </a>
              ) : null}
            </div>
          )}
        </div>

        {/* ── ACTION CARDS ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
        }}>
          {/* Card 1 — Webinar */}
          <div style={cardStyle}>
            <div style={iconStyle}>🎥</div>
            <h3 style={cardTitle}>{hasPersonalZoom ? 'Your Webinar Access' : 'Upcoming Webinar'}</h3>
            <p style={cardBody}>
              {hasPersonalZoom
                ? "You're confirmed. Click below to join your masterclass when it begins — no extra signup needed."
                : 'Expert guidance on building a career in Data Science. Free access.'}
            </p>
            <a href={effectiveWebinarUrl} target="_blank" rel="noopener noreferrer" style={btnPrimary}>
              {hasPersonalZoom ? 'Join Webinar →' : 'Save My Spot →'}
            </a>
          </div>

          {/* Card 2 — Phone */}
          <div style={cardStyle}>
            <div style={iconStyle}>📞</div>
            <h3 style={cardTitle}>Need Help? Talk to Us</h3>
            <p style={cardBody}>Advisors available Mon–Sat, 9 AM to 7 PM.</p>
            <a href={`tel:${PHONE_NUMBER}`} style={btnOutline}>
              Call 95555 25908
            </a>
          </div>

          {/* Card 3 — WhatsApp */}
          <div style={cardStyle}>
            <div style={iconStyle}>💬</div>
            <h3 style={cardTitle}>Chat on WhatsApp</h3>
            <p style={cardBody}>Connect with our counsellor instantly on WhatsApp.</p>
            <a href={`https://api.whatsapp.com/send?phone=${PHONE_NUMBER}&text=${WA_MESSAGE}`}
              target="_blank" rel="noopener noreferrer" style={btnWhatsapp}>
              Chat Now
            </a>
          </div>
        </div>
      </main>

      <footer style={{ textAlign: 'center', padding: '40px 24px 0', fontSize: '12px', color: '#4A6275' }}>
        © {new Date().getFullYear()} AnalytixLabs. All rights reserved. | NASSCOM-FutureSkills Prime Accredited.
      </footer>
    </div>
  );
}

const cardStyle: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.7)',
  borderRadius: '20px',
  padding: '32px 24px',
  border: '1.5px solid #e0eeeb',
  boxShadow: '0 4px 24px rgba(9,38,63,0.05)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
  gap: '16px',
};
const iconStyle: React.CSSProperties = { fontSize: '42px' };
const cardTitle: React.CSSProperties = { fontSize: '18px', fontWeight: 800, color: navy, margin: 0, fontFamily: 'var(--font-outfit)' };
const cardBody: React.CSSProperties = { fontSize: '14px', color: '#4A6275', lineHeight: 1.5, margin: 0, flexGrow: 1 };
const btnBase: React.CSSProperties = {
  width: '100%', borderRadius: '12px', padding: '12px 24px',
  fontSize: '15px', fontWeight: 700, textDecoration: 'none', textAlign: 'center', transition: 'all 0.2s'
};
const btnPrimary: React.CSSProperties = { ...btnBase, background: teal, color: navy, boxShadow: '0 4px 14px rgba(29,229,181,0.2)' };
const btnOutline: React.CSSProperties = { ...btnBase, border: '1.5px solid #D6ECEB', color: navy, background: 'white' };
const btnWhatsapp: React.CSSProperties = { ...btnBase, background: '#25D366', color: '#fff', boxShadow: '0 4px 14px rgba(37,211,102,0.2)' };
