import fs from 'fs';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'data', 'db.json');

export interface SpeakerSettings {
  speakerName: string;
  speakerTitle: string;
  speakerImage: string;
  speakerBio: string;
}

export interface Registration {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  status: string;
  city: string;
  createdAt: string;
}

export interface Faq {
  id: string;
  q: string;
  a: string;
  order: number;
}

const DEFAULT_FAQS: Faq[] = [
  { id: 'seed-1', q: 'Is this really free?', a: 'Yes, this is a community-first session with no hidden costs or upsells.', order: 0 },
  { id: 'seed-2', q: 'Do I need coding experience?', a: 'None required. We start from Excel basics and move into AI tools.', order: 1 },
  { id: 'seed-3', q: 'Will I get a recording?', a: 'Live attendance is encouraged, but a 48-hour recording link is shared.', order: 2 },
  { id: 'seed-4', q: 'Is there a certificate?', a: 'Yes, all live attendees get a Masterclass Completion certificate.', order: 3 },
  { id: 'seed-5', q: 'What is the difference between a Data Analyst and a Data Scientist?', a: 'A Data Analyst focuses on querying, visualizing, and reporting on existing data using Excel, SQL, and BI tools like Power BI or Tableau. A Data Scientist extends this work with statistical modeling and machine learning in Python to make predictions about future outcomes. In 2026, both roles increasingly use AI co-pilots to speed up analysis.', order: 4 },
  { id: 'seed-6', q: 'How long does it take to become a Data Analyst in 2026?', a: 'A focused 4 to 6-month plan covering Excel, SQL, Power BI, and Python fundamentals is enough to land an entry-level Data Analyst role. Mastery and senior roles typically take 1 to 2 years of consistent project work.', order: 5 },
  { id: 'seed-7', q: 'What salary can a Data Analyst expect in India in 2026?', a: 'Entry-level Data Analyst salaries in India typically range from ₹4-8 LPA. Mid-level (3-5 years) ranges ₹10-18 LPA, and Data Scientists at the same experience earn 20-40% more on average. Our placement track records a ₹6L minimum CTC for graduates.', order: 6 },
  { id: 'seed-8', q: 'Is Python required for data analysis?', a: 'Python is not required to start, but it becomes important once you outgrow Excel and SQL — particularly for automation, statistical analysis, and predictive modeling. Data Scientists need Python, while Data Analysts can succeed with strong SQL + BI skills alone.', order: 7 },
];

export interface DbSchema {
  settings: SpeakerSettings;
  registrations: Registration[];
  faqs: Faq[];
}

function defaultDb(): DbSchema {
  return {
    settings: {
      speakerName: "Sumeet Singh",
      speakerTitle: "Co-founder & Chief Learning Officer",
      speakerImage: "/brand/avatar-piyush.png",
      speakerBio: "A pioneer in AI and Data Science education in India. Ex-McKinsey & ZS Associates."
    },
    registrations: [],
    faqs: [...DEFAULT_FAQS]
  };
}

export function getDb(): DbSchema {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    const parsed = JSON.parse(data) as Partial<DbSchema>;
    return {
      ...defaultDb(),
      ...parsed,
      faqs: parsed.faqs ?? [...DEFAULT_FAQS],
    };
  } catch (error) {
    console.error('Error reading DB:', error);
    return defaultDb();
  }
}

export function saveDb(data: DbSchema) {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing DB:', error);
  }
}

export function getSettings(): SpeakerSettings {
  return getDb().settings;
}

export function updateSettings(newSettings: Partial<SpeakerSettings>) {
  const db = getDb();
  db.settings = { ...db.settings, ...newSettings };
  saveDb(db);
  return db.settings;
}

export function getRegistrations(): Registration[] {
  return getDb().registrations;
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 11);
}

export function addRegistration(reg: Omit<Registration, 'id' | 'createdAt'>) {
  const db = getDb();
  const newReg: Registration = {
    ...reg,
    id: shortId(),
    createdAt: new Date().toISOString()
  };
  db.registrations.unshift(newReg);
  saveDb(db);
  return newReg;
}

export function getFaqs(): Faq[] {
  return [...getDb().faqs].sort((a, b) => a.order - b.order);
}

export type FaqInput = { q: string; a: string };

function sanitizeFaqInput(input: FaqInput): FaqInput | null {
  const q = (input?.q ?? '').toString().trim();
  const a = (input?.a ?? '').toString().trim();
  if (!q || !a) return null;
  if (q.length > 300 || a.length > 2000) return null;
  return { q, a };
}

export function replaceFaqs(items: Array<FaqInput & { id?: string }>): Faq[] {
  const db = getDb();
  const clean: Faq[] = [];
  items.forEach((item, idx) => {
    const sanitized = sanitizeFaqInput(item);
    if (!sanitized) return;
    clean.push({
      id: item.id && typeof item.id === 'string' ? item.id : shortId(),
      q: sanitized.q,
      a: sanitized.a,
      order: idx,
    });
  });
  db.faqs = clean;
  saveDb(db);
  return clean;
}
