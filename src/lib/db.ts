import { getServiceClient } from './supabase';

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

const DEFAULT_SETTINGS: SpeakerSettings = {
  speakerName: 'Sumeet Singh',
  speakerTitle: 'Co-founder & Chief Learning Officer',
  speakerImage: '/brand/avatar-piyush.png',
  speakerBio: 'A pioneer in AI and Data Science education in India. Ex-McKinsey & ZS Associates.',
};

function client() {
  const c = getServiceClient();
  if (!c) throw new Error('Supabase client not configured (missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY).');
  return c;
}

function shortId(): string {
  return Math.random().toString(36).slice(2, 11);
}

type SettingsRow = {
  id: string;
  speaker_name: string;
  speaker_title: string;
  speaker_image: string;
  speaker_bio: string;
};

type RegistrationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  city: string;
  created_at: string;
};

type FaqRow = {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
};

function mapSettings(row: SettingsRow): SpeakerSettings {
  return {
    speakerName: row.speaker_name,
    speakerTitle: row.speaker_title,
    speakerImage: row.speaker_image,
    speakerBio: row.speaker_bio,
  };
}

function mapRegistration(row: RegistrationRow): Registration {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    city: row.city,
    createdAt: row.created_at,
  };
}

function mapFaq(row: FaqRow): Faq {
  return { id: row.id, q: row.question, a: row.answer, order: row.sort_order };
}

export async function getSettings(): Promise<SpeakerSettings> {
  try {
    const { data, error } = await client()
      .from('settings')
      .select('*')
      .eq('id', 'speaker')
      .maybeSingle<SettingsRow>();
    if (error) throw error;
    return data ? mapSettings(data) : DEFAULT_SETTINGS;
  } catch (err) {
    console.error('[db.getSettings]', err);
    return DEFAULT_SETTINGS;
  }
}

export async function updateSettings(newSettings: Partial<SpeakerSettings>): Promise<SpeakerSettings> {
  const current = await getSettings();
  const merged = { ...current, ...newSettings };
  const { error } = await client()
    .from('settings')
    .upsert({
      id: 'speaker',
      speaker_name: merged.speakerName,
      speaker_title: merged.speakerTitle,
      speaker_image: merged.speakerImage,
      speaker_bio: merged.speakerBio,
    });
  if (error) throw error;
  return merged;
}

export async function getRegistrations(): Promise<Registration[]> {
  try {
    const { data, error } = await client()
      .from('registrations')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapRegistration);
  } catch (err) {
    console.error('[db.getRegistrations]', err);
    return [];
  }
}

/**
 * Returns an existing registration matching `email` (case-insensitive) OR `phone`.
 * Used to prevent duplicate signups before any external systems (WhatsApp, Zoom,
 * LeadSquared) are called.
 */
export async function findRegistrationByEmailOrPhone(
  email: string,
  phone: string,
): Promise<Registration | null> {
  const normEmail = email.trim().toLowerCase();
  const normPhone = phone.replace(/\D/g, '');
  if (!normEmail && !normPhone) return null;

  try {
    const supabase = client();
    const [byEmail, byPhone] = await Promise.all([
      normEmail
        ? supabase.from('registrations').select('*').ilike('email', normEmail).limit(1)
        : Promise.resolve({ data: null, error: null }),
      normPhone
        ? supabase.from('registrations').select('*').eq('phone', normPhone).limit(1)
        : Promise.resolve({ data: null, error: null }),
    ]);
    if (byEmail.error) throw byEmail.error;
    if (byPhone.error) throw byPhone.error;
    const row = (byEmail.data?.[0] ?? byPhone.data?.[0]) as RegistrationRow | undefined;
    return row ? mapRegistration(row) : null;
  } catch (err) {
    console.error('[db.findRegistrationByEmailOrPhone]', err);
    return null;
  }
}

export async function addRegistration(reg: Omit<Registration, 'id' | 'createdAt'>): Promise<Registration> {
  const row: RegistrationRow = {
    id: shortId(),
    full_name: reg.fullName,
    email: reg.email,
    phone: reg.phone,
    status: reg.status,
    city: reg.city,
    created_at: new Date().toISOString(),
  };
  const { error } = await client().from('registrations').insert(row);
  if (error) throw error;
  return mapRegistration(row);
}

export async function getFaqs(): Promise<Faq[]> {
  try {
    const { data, error } = await client()
      .from('faqs')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapFaq);
  } catch (err) {
    console.error('[db.getFaqs]', err);
    return [];
  }
}

export type FaqInput = { q: string; a: string };

function sanitizeFaqInput(input: FaqInput): FaqInput | null {
  const q = (input?.q ?? '').toString().trim();
  const a = (input?.a ?? '').toString().trim();
  if (!q || !a) return null;
  if (q.length > 300 || a.length > 2000) return null;
  return { q, a };
}

export async function replaceFaqs(items: Array<FaqInput & { id?: string }>): Promise<Faq[]> {
  const clean: FaqRow[] = [];
  items.forEach((item, idx) => {
    const sanitized = sanitizeFaqInput(item);
    if (!sanitized) return;
    clean.push({
      id: item.id && typeof item.id === 'string' ? item.id : shortId(),
      question: sanitized.q,
      answer: sanitized.a,
      sort_order: idx,
    });
  });

  const supabase = client();
  const { error: delError } = await supabase.from('faqs').delete().not('id', 'is', null);
  if (delError) throw delError;

  if (clean.length) {
    const { error: insError } = await supabase.from('faqs').insert(clean);
    if (insError) throw insError;
  }

  return clean.map(mapFaq);
}
