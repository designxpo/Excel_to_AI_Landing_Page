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
  // OTP telemetry — optional in callers (legacy rows, register API, etc.)
  // but always present on rows read back from the DB (mapRegistration fills
  // these from the row, defaulting to null if the column is null/missing).
  whatsappStatus?: string | null;
  whatsappError?: string | null;
  verifiedAt?: string | null;
  attemptNumber?: number | null;
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
  // Dynamic webinar fields (Phase 1 — all nullable, code falls back to hardcoded values)
  webinar_title?: string | null;
  webinar_subtitle?: string | null;
  eyebrow_text?: string | null;
  webinar_date_label?: string | null;
  webinar_time_label?: string | null;
  webinar_datetime_utc?: string | null;
  duration_label?: string | null;
  meta_title?: string | null;
  meta_description?: string | null;
  og_image_url?: string | null;
  form_heading?: string | null;
  form_subheading?: string | null;
  sticky_eyebrow?: string | null;
  sticky_main?: string | null;
  cta_button_text?: string | null;
  nav_cta_text?: string | null;
  logo_path?: string | null;
  zoom_webinar_id?: string | null;
  lsq_source_name?: string | null;
  whatsapp_template_name?: string | null;
  hero_stat_1_value?: string | null;
  hero_stat_1_label?: string | null;
  hero_stat_2_value?: string | null;
  hero_stat_2_label?: string | null;
  hero_stat_3_value?: string | null;
  hero_stat_3_label?: string | null;
  show_definition_section?: boolean | null;
  definition_section_title?: string | null;
  definition_intro?: string | null;
  definition_a_title?: string | null;
  definition_a_body?: string | null;
  definition_b_title?: string | null;
  definition_b_body?: string | null;
  agenda_section_title?: string | null;
  agenda_section_subtitle?: string | null;
  faculty_intro?: string | null;
  footer_text?: string | null;
  // Phase 2 fields
  hero_eyebrow_pill?: string | null;
  hero_h1_markup?: string | null;
  hero_subtitle?: string | null;
  countdown_label?: string | null;
  urgency_badge_text?: string | null;
  save_spot_cta_text?: string | null;
  form_pill_date_label?: string | null;
  form_pill_seats_label?: string | null;
  form_otp_footer_label?: string | null;
  form_bottom_stat_1_value?: string | null;
  form_bottom_stat_1_label?: string | null;
  form_bottom_stat_2_value?: string | null;
  form_bottom_stat_2_label?: string | null;
  form_bottom_stat_3_value?: string | null;
  form_bottom_stat_3_label?: string | null;
  stats_disclaimer?: string | null;
  partnership_caption?: string | null;
  partnership_image_path?: string | null;
  definition_eyebrow?: string | null;
  definition_a_bullets?: string | null;
  definition_b_bullets?: string | null;
  features_section_title?: string | null;
  features_section_subtitle?: string | null;
  features_image_path?: string | null;
  session_inside_pill?: string | null;
  session_badge_1?: string | null;
  session_badge_2?: string | null;
  session_badge_3?: string | null;
  session_obj_eyebrow?: string | null;
  session_obj_title?: string | null;
  session_obj_1_num?: string | null;
  session_obj_1_title?: string | null;
  session_obj_1_desc?: string | null;
  session_obj_2_num?: string | null;
  session_obj_2_title?: string | null;
  session_obj_2_desc?: string | null;
  session_walkthrough_eyebrow?: string | null;
  session_walkthrough_title?: string | null;
  faculty_heading_prefix?: string | null;
  faq_section_title?: string | null;
  // Phase 3 fields
  footer_link_1_label?: string | null;
  footer_link_1_url?: string | null;
  footer_link_2_label?: string | null;
  footer_link_2_url?: string | null;
  footer_link_3_label?: string | null;
  footer_link_3_url?: string | null;
  footer_link_4_label?: string | null;
  footer_link_4_url?: string | null;
  form_label_name?: string | null;
  form_label_email?: string | null;
  form_label_phone?: string | null;
  form_label_status?: string | null;
  form_label_city?: string | null;
  form_label_referral?: string | null;
  form_placeholder_name?: string | null;
  form_placeholder_email?: string | null;
  form_placeholder_phone?: string | null;
  form_placeholder_select?: string | null;
  form_placeholder_city?: string | null;
  form_status_options?: string | null;
  form_referral_options?: string | null;
  otp_heading?: string | null;
  otp_subtitle_template?: string | null;
  otp_edit_details_label?: string | null;
  otp_verify_button_text?: string | null;
  otp_resend_label?: string | null;
  otp_help_text?: string | null;
  otp_help_whatsapp_number?: string | null;
  success_heading?: string | null;
  success_body?: string | null;
  faculty_chip_1?: string | null;
  faculty_chip_2?: string | null;
  faculty_chip_3?: string | null;
  partnership_image_alt?: string | null;
  // Phase 4 (ThankYouPage)
  thankyou_heading?: string | null;
  thankyou_subcopy?: string | null;
  thankyou_confirmation_template?: string | null;
  thankyou_webinar_title_personal?: string | null;
  thankyou_webinar_title_default?: string | null;
  thankyou_webinar_body_personal?: string | null;
  thankyou_webinar_body_default?: string | null;
  thankyou_webinar_cta_personal?: string | null;
  thankyou_webinar_cta_default?: string | null;
  thankyou_phone_title?: string | null;
  thankyou_phone_body?: string | null;
  thankyou_phone_cta?: string | null;
  thankyou_phone_number?: string | null;
  thankyou_whatsapp_title?: string | null;
  thankyou_whatsapp_body?: string | null;
  thankyou_whatsapp_cta?: string | null;
  thankyou_whatsapp_number?: string | null;
  thankyou_whatsapp_message?: string | null;
  thankyou_footer_text?: string | null;
  generic_brochure_url?: string | null;
  generic_brochure_cta?: string | null;
};

export interface WebinarConfig extends SpeakerSettings {
  webinarTitle: string | null;
  webinarSubtitle: string | null;
  eyebrowText: string | null;
  webinarDateLabel: string | null;
  webinarTimeLabel: string | null;
  webinarDatetimeUtc: string | null;
  durationLabel: string | null;
  metaTitle: string | null;
  metaDescription: string | null;
  ogImageUrl: string | null;
  formHeading: string | null;
  formSubheading: string | null;
  stickyEyebrow: string | null;
  stickyMain: string | null;
  ctaButtonText: string | null;
  navCtaText: string | null;
  logoPath: string | null;
  zoomWebinarId: string | null;
  lsqSourceName: string | null;
  whatsappTemplateName: string | null;
  heroStat1Value: string | null;
  heroStat1Label: string | null;
  heroStat2Value: string | null;
  heroStat2Label: string | null;
  heroStat3Value: string | null;
  heroStat3Label: string | null;
  showDefinitionSection: boolean | null;
  definitionSectionTitle: string | null;
  definitionIntro: string | null;
  definitionATitle: string | null;
  definitionABody: string | null;
  definitionBTitle: string | null;
  definitionBBody: string | null;
  agendaSectionTitle: string | null;
  agendaSectionSubtitle: string | null;
  facultyIntro: string | null;
  footerText: string | null;
  // Phase 2
  heroEyebrowPill: string | null;
  heroH1Markup: string | null;
  heroSubtitle: string | null;
  countdownLabel: string | null;
  urgencyBadgeText: string | null;
  saveSpotCtaText: string | null;
  formPillDateLabel: string | null;
  formPillSeatsLabel: string | null;
  formOtpFooterLabel: string | null;
  formBottomStat1Value: string | null;
  formBottomStat1Label: string | null;
  formBottomStat2Value: string | null;
  formBottomStat2Label: string | null;
  formBottomStat3Value: string | null;
  formBottomStat3Label: string | null;
  statsDisclaimer: string | null;
  partnershipCaption: string | null;
  partnershipImagePath: string | null;
  definitionEyebrow: string | null;
  definitionABullets: string | null;
  definitionBBullets: string | null;
  featuresSectionTitle: string | null;
  featuresSectionSubtitle: string | null;
  featuresImagePath: string | null;
  sessionInsidePill: string | null;
  sessionBadge1: string | null;
  sessionBadge2: string | null;
  sessionBadge3: string | null;
  sessionObjEyebrow: string | null;
  sessionObjTitle: string | null;
  sessionObj1Num: string | null;
  sessionObj1Title: string | null;
  sessionObj1Desc: string | null;
  sessionObj2Num: string | null;
  sessionObj2Title: string | null;
  sessionObj2Desc: string | null;
  sessionWalkthroughEyebrow: string | null;
  sessionWalkthroughTitle: string | null;
  facultyHeadingPrefix: string | null;
  faqSectionTitle: string | null;
  // Phase 3
  footerLink1Label: string | null;
  footerLink1Url: string | null;
  footerLink2Label: string | null;
  footerLink2Url: string | null;
  footerLink3Label: string | null;
  footerLink3Url: string | null;
  footerLink4Label: string | null;
  footerLink4Url: string | null;
  formLabelName: string | null;
  formLabelEmail: string | null;
  formLabelPhone: string | null;
  formLabelStatus: string | null;
  formLabelCity: string | null;
  formLabelReferral: string | null;
  formPlaceholderName: string | null;
  formPlaceholderEmail: string | null;
  formPlaceholderPhone: string | null;
  formPlaceholderSelect: string | null;
  formPlaceholderCity: string | null;
  formStatusOptions: string | null;
  formReferralOptions: string | null;
  otpHeading: string | null;
  otpSubtitleTemplate: string | null;
  otpEditDetailsLabel: string | null;
  otpVerifyButtonText: string | null;
  otpResendLabel: string | null;
  otpHelpText: string | null;
  otpHelpWhatsappNumber: string | null;
  successHeading: string | null;
  successBody: string | null;
  facultyChip1: string | null;
  facultyChip2: string | null;
  facultyChip3: string | null;
  partnershipImageAlt: string | null;
  // Phase 4
  thankyouHeading: string | null;
  thankyouSubcopy: string | null;
  thankyouConfirmationTemplate: string | null;
  thankyouWebinarTitlePersonal: string | null;
  thankyouWebinarTitleDefault: string | null;
  thankyouWebinarBodyPersonal: string | null;
  thankyouWebinarBodyDefault: string | null;
  thankyouWebinarCtaPersonal: string | null;
  thankyouWebinarCtaDefault: string | null;
  thankyouPhoneTitle: string | null;
  thankyouPhoneBody: string | null;
  thankyouPhoneCta: string | null;
  thankyouPhoneNumber: string | null;
  thankyouWhatsappTitle: string | null;
  thankyouWhatsappBody: string | null;
  thankyouWhatsappCta: string | null;
  thankyouWhatsappNumber: string | null;
  thankyouWhatsappMessage: string | null;
  thankyouFooterText: string | null;
  genericBrochureUrl: string | null;
  genericBrochureCta: string | null;
}

export interface Feature {
  id: string;
  icon: string | null;
  title: string;
  description: string;
  accent: string | null;
  sortOrder: number;
}

export interface AgendaItem {
  id: string;
  title: string;
  description: string;
  highlight: boolean;
  sortOrder: number;
}

type FeatureRow = {
  id: string;
  icon: string | null;
  title: string;
  description: string;
  accent: string | null;
  sort_order: number;
};

type AgendaItemRow = {
  id: string;
  title: string;
  description: string;
  highlight: boolean;
  sort_order: number;
};

type RegistrationRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;
  city: string;
  created_at: string;
  whatsapp_status?: string | null;
  whatsapp_error?: string | null;
  verified_at?: string | null;
  attempt_number?: number | null;
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
    whatsappStatus: row.whatsapp_status ?? null,
    whatsappError: row.whatsapp_error ?? null,
    verifiedAt: row.verified_at ?? null,
    attemptNumber: row.attempt_number ?? null,
  };
}

function mapFaq(row: FaqRow): Faq {
  return { id: row.id, q: row.question, a: row.answer, order: row.sort_order };
}

function mapWebinarConfig(row: SettingsRow): WebinarConfig {
  return {
    // Existing speaker fields
    speakerName: row.speaker_name,
    speakerTitle: row.speaker_title,
    speakerImage: row.speaker_image,
    speakerBio: row.speaker_bio,
    // New dynamic fields
    webinarTitle: row.webinar_title ?? null,
    webinarSubtitle: row.webinar_subtitle ?? null,
    eyebrowText: row.eyebrow_text ?? null,
    webinarDateLabel: row.webinar_date_label ?? null,
    webinarTimeLabel: row.webinar_time_label ?? null,
    webinarDatetimeUtc: row.webinar_datetime_utc ?? null,
    durationLabel: row.duration_label ?? null,
    metaTitle: row.meta_title ?? null,
    metaDescription: row.meta_description ?? null,
    ogImageUrl: row.og_image_url ?? null,
    formHeading: row.form_heading ?? null,
    formSubheading: row.form_subheading ?? null,
    stickyEyebrow: row.sticky_eyebrow ?? null,
    stickyMain: row.sticky_main ?? null,
    ctaButtonText: row.cta_button_text ?? null,
    navCtaText: row.nav_cta_text ?? null,
    logoPath: row.logo_path ?? null,
    zoomWebinarId: row.zoom_webinar_id ?? null,
    lsqSourceName: row.lsq_source_name ?? null,
    whatsappTemplateName: row.whatsapp_template_name ?? null,
    heroStat1Value: row.hero_stat_1_value ?? null,
    heroStat1Label: row.hero_stat_1_label ?? null,
    heroStat2Value: row.hero_stat_2_value ?? null,
    heroStat2Label: row.hero_stat_2_label ?? null,
    heroStat3Value: row.hero_stat_3_value ?? null,
    heroStat3Label: row.hero_stat_3_label ?? null,
    showDefinitionSection: row.show_definition_section ?? null,
    definitionSectionTitle: row.definition_section_title ?? null,
    definitionIntro: row.definition_intro ?? null,
    definitionATitle: row.definition_a_title ?? null,
    definitionABody: row.definition_a_body ?? null,
    definitionBTitle: row.definition_b_title ?? null,
    definitionBBody: row.definition_b_body ?? null,
    agendaSectionTitle: row.agenda_section_title ?? null,
    agendaSectionSubtitle: row.agenda_section_subtitle ?? null,
    facultyIntro: row.faculty_intro ?? null,
    footerText: row.footer_text ?? null,
    // Phase 2
    heroEyebrowPill: row.hero_eyebrow_pill ?? null,
    heroH1Markup: row.hero_h1_markup ?? null,
    heroSubtitle: row.hero_subtitle ?? null,
    countdownLabel: row.countdown_label ?? null,
    urgencyBadgeText: row.urgency_badge_text ?? null,
    saveSpotCtaText: row.save_spot_cta_text ?? null,
    formPillDateLabel: row.form_pill_date_label ?? null,
    formPillSeatsLabel: row.form_pill_seats_label ?? null,
    formOtpFooterLabel: row.form_otp_footer_label ?? null,
    formBottomStat1Value: row.form_bottom_stat_1_value ?? null,
    formBottomStat1Label: row.form_bottom_stat_1_label ?? null,
    formBottomStat2Value: row.form_bottom_stat_2_value ?? null,
    formBottomStat2Label: row.form_bottom_stat_2_label ?? null,
    formBottomStat3Value: row.form_bottom_stat_3_value ?? null,
    formBottomStat3Label: row.form_bottom_stat_3_label ?? null,
    statsDisclaimer: row.stats_disclaimer ?? null,
    partnershipCaption: row.partnership_caption ?? null,
    partnershipImagePath: row.partnership_image_path ?? null,
    definitionEyebrow: row.definition_eyebrow ?? null,
    definitionABullets: row.definition_a_bullets ?? null,
    definitionBBullets: row.definition_b_bullets ?? null,
    featuresSectionTitle: row.features_section_title ?? null,
    featuresSectionSubtitle: row.features_section_subtitle ?? null,
    featuresImagePath: row.features_image_path ?? null,
    sessionInsidePill: row.session_inside_pill ?? null,
    sessionBadge1: row.session_badge_1 ?? null,
    sessionBadge2: row.session_badge_2 ?? null,
    sessionBadge3: row.session_badge_3 ?? null,
    sessionObjEyebrow: row.session_obj_eyebrow ?? null,
    sessionObjTitle: row.session_obj_title ?? null,
    sessionObj1Num: row.session_obj_1_num ?? null,
    sessionObj1Title: row.session_obj_1_title ?? null,
    sessionObj1Desc: row.session_obj_1_desc ?? null,
    sessionObj2Num: row.session_obj_2_num ?? null,
    sessionObj2Title: row.session_obj_2_title ?? null,
    sessionObj2Desc: row.session_obj_2_desc ?? null,
    sessionWalkthroughEyebrow: row.session_walkthrough_eyebrow ?? null,
    sessionWalkthroughTitle: row.session_walkthrough_title ?? null,
    facultyHeadingPrefix: row.faculty_heading_prefix ?? null,
    faqSectionTitle: row.faq_section_title ?? null,
    // Phase 3
    footerLink1Label: row.footer_link_1_label ?? null,
    footerLink1Url: row.footer_link_1_url ?? null,
    footerLink2Label: row.footer_link_2_label ?? null,
    footerLink2Url: row.footer_link_2_url ?? null,
    footerLink3Label: row.footer_link_3_label ?? null,
    footerLink3Url: row.footer_link_3_url ?? null,
    footerLink4Label: row.footer_link_4_label ?? null,
    footerLink4Url: row.footer_link_4_url ?? null,
    formLabelName: row.form_label_name ?? null,
    formLabelEmail: row.form_label_email ?? null,
    formLabelPhone: row.form_label_phone ?? null,
    formLabelStatus: row.form_label_status ?? null,
    formLabelCity: row.form_label_city ?? null,
    formLabelReferral: row.form_label_referral ?? null,
    formPlaceholderName: row.form_placeholder_name ?? null,
    formPlaceholderEmail: row.form_placeholder_email ?? null,
    formPlaceholderPhone: row.form_placeholder_phone ?? null,
    formPlaceholderSelect: row.form_placeholder_select ?? null,
    formPlaceholderCity: row.form_placeholder_city ?? null,
    formStatusOptions: row.form_status_options ?? null,
    formReferralOptions: row.form_referral_options ?? null,
    otpHeading: row.otp_heading ?? null,
    otpSubtitleTemplate: row.otp_subtitle_template ?? null,
    otpEditDetailsLabel: row.otp_edit_details_label ?? null,
    otpVerifyButtonText: row.otp_verify_button_text ?? null,
    otpResendLabel: row.otp_resend_label ?? null,
    otpHelpText: row.otp_help_text ?? null,
    otpHelpWhatsappNumber: row.otp_help_whatsapp_number ?? null,
    successHeading: row.success_heading ?? null,
    successBody: row.success_body ?? null,
    facultyChip1: row.faculty_chip_1 ?? null,
    facultyChip2: row.faculty_chip_2 ?? null,
    facultyChip3: row.faculty_chip_3 ?? null,
    partnershipImageAlt: row.partnership_image_alt ?? null,
    // Phase 4
    thankyouHeading: row.thankyou_heading ?? null,
    thankyouSubcopy: row.thankyou_subcopy ?? null,
    thankyouConfirmationTemplate: row.thankyou_confirmation_template ?? null,
    thankyouWebinarTitlePersonal: row.thankyou_webinar_title_personal ?? null,
    thankyouWebinarTitleDefault: row.thankyou_webinar_title_default ?? null,
    thankyouWebinarBodyPersonal: row.thankyou_webinar_body_personal ?? null,
    thankyouWebinarBodyDefault: row.thankyou_webinar_body_default ?? null,
    thankyouWebinarCtaPersonal: row.thankyou_webinar_cta_personal ?? null,
    thankyouWebinarCtaDefault: row.thankyou_webinar_cta_default ?? null,
    thankyouPhoneTitle: row.thankyou_phone_title ?? null,
    thankyouPhoneBody: row.thankyou_phone_body ?? null,
    thankyouPhoneCta: row.thankyou_phone_cta ?? null,
    thankyouPhoneNumber: row.thankyou_phone_number ?? null,
    thankyouWhatsappTitle: row.thankyou_whatsapp_title ?? null,
    thankyouWhatsappBody: row.thankyou_whatsapp_body ?? null,
    thankyouWhatsappCta: row.thankyou_whatsapp_cta ?? null,
    thankyouWhatsappNumber: row.thankyou_whatsapp_number ?? null,
    thankyouWhatsappMessage: row.thankyou_whatsapp_message ?? null,
    thankyouFooterText: row.thankyou_footer_text ?? null,
    genericBrochureUrl: row.generic_brochure_url ?? null,
    genericBrochureCta: row.generic_brochure_cta ?? null,
  };
}

function mapFeature(row: FeatureRow): Feature {
  return {
    id: row.id,
    icon: row.icon,
    title: row.title,
    description: row.description,
    accent: row.accent,
    sortOrder: row.sort_order,
  };
}

function mapAgendaItem(row: AgendaItemRow): AgendaItem {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    highlight: row.highlight,
    sortOrder: row.sort_order,
  };
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
 * Returns an existing VERIFIED registration matching `email` (case-insensitive)
 * OR `phone`. Used to prevent duplicate completed signups. Unverified rows are
 * intentionally ignored so users can retry the OTP step.
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
        ? supabase.from('registrations').select('*').ilike('email', normEmail).eq('status', 'Verified').limit(1)
        : Promise.resolve({ data: null, error: null }),
      normPhone
        ? supabase.from('registrations').select('*').eq('phone', normPhone).eq('status', 'Verified').limit(1)
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

/**
 * Inserts an unverified lead. Returns the new registration's id so the caller
 * can embed it in the OTP token and later mark it verified.
 *
 * Captures OTP delivery telemetry (whatsappStatus / whatsappError) and
 * auto-computes attemptNumber as (count of prior rows for this email or
 * phone) + 1, so the admin panel can show "this is the user's 3rd attempt".
 */
export async function addUnverifiedRegistration(
  reg: Omit<Registration, 'id' | 'createdAt' | 'status' | 'attemptNumber'> & {
    whatsappStatus?: string | null;
    whatsappError?: string | null;
  },
): Promise<Registration> {
  const supabase = client();

  // Compute the user's attempt number (best-effort — defaults to 1 if the
  // count query fails for any reason).
  let attemptNumber = 1;
  try {
    const normEmail = (reg.email ?? '').trim().toLowerCase();
    const normPhone = (reg.phone ?? '').replace(/\D/g, '');
    const orClause: string[] = [];
    if (normEmail) orClause.push(`email.ilike.${normEmail}`);
    if (normPhone) orClause.push(`phone.eq.${normPhone}`);
    if (orClause.length) {
      const { count } = await supabase
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .or(orClause.join(','));
      if (typeof count === 'number') attemptNumber = count + 1;
    }
  } catch (err) {
    console.error('[db.addUnverifiedRegistration] attempt count failed:', err);
  }

  const row: RegistrationRow = {
    id: shortId(),
    full_name: reg.fullName,
    email: reg.email,
    phone: reg.phone,
    status: 'Unverified',
    city: reg.city,
    created_at: new Date().toISOString(),
    whatsapp_status: reg.whatsappStatus ?? null,
    whatsapp_error: reg.whatsappError ?? null,
    verified_at: null,
    attempt_number: attemptNumber,
  };
  const { error } = await supabase.from('registrations').insert(row);
  if (error) throw error;
  return mapRegistration(row);
}

/**
 * Promotes an unverified registration row to verified. If `id` matches no row
 * (legacy token / DB cleanup), falls back to inserting a new verified row so
 * we never lose the completion event.
 */
export async function markRegistrationVerified(
  id: string,
  reg: Omit<Registration, 'id' | 'createdAt'>,
): Promise<Registration> {
  const supabase = client();
  const { data, error } = await supabase
    .from('registrations')
    .update({ status: 'Verified', verified_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .maybeSingle<RegistrationRow>();
  if (error) throw error;
  if (data) return mapRegistration(data);
  // Fallback: row not found (old token from before this refactor)
  return addRegistration(reg);
}

export type RegistrationStats = {
  total: number;
  verified: number;
  unverified: number;
  uniqueEmailsStarted: number;
  uniqueEmailsVerified: number;
};

export async function getRegistrationStats(): Promise<RegistrationStats> {
  try {
    const supabase = client();
    // Two count queries — fast even on large tables thanks to the index.
    const [totalRes, verifiedRes, unverifiedRes, allEmailsRes, verifiedEmailsRes] = await Promise.all([
      supabase.from('registrations').select('*', { count: 'exact', head: true }),
      supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'Verified'),
      supabase.from('registrations').select('*', { count: 'exact', head: true }).eq('status', 'Unverified'),
      supabase.from('registrations').select('email'),
      supabase.from('registrations').select('email').eq('status', 'Verified'),
    ]);
    if (totalRes.error) throw totalRes.error;
    if (verifiedRes.error) throw verifiedRes.error;
    if (unverifiedRes.error) throw unverifiedRes.error;

    const uniqueEmailsStarted = new Set((allEmailsRes.data ?? []).map((r: { email: string }) => r.email.toLowerCase())).size;
    const uniqueEmailsVerified = new Set((verifiedEmailsRes.data ?? []).map((r: { email: string }) => r.email.toLowerCase())).size;

    return {
      total: totalRes.count ?? 0,
      verified: verifiedRes.count ?? 0,
      unverified: unverifiedRes.count ?? 0,
      uniqueEmailsStarted,
      uniqueEmailsVerified,
    };
  } catch (err) {
    console.error('[db.getRegistrationStats]', err);
    return { total: 0, verified: 0, unverified: 0, uniqueEmailsStarted: 0, uniqueEmailsVerified: 0 };
  }
}

export type RegistrationsPage = {
  data: Registration[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getRegistrationsPaginated(
  page: number = 1,
  pageSize: number = 50,
): Promise<RegistrationsPage> {
  const safePage = Math.max(1, Math.floor(page));
  const safeSize = Math.max(1, Math.min(200, Math.floor(pageSize)));
  const from = (safePage - 1) * safeSize;
  const to = from + safeSize - 1;
  try {
    const { data, error, count } = await client()
      .from('registrations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);
    if (error) throw error;
    return {
      data: (data ?? []).map(mapRegistration),
      total: count ?? 0,
      page: safePage,
      pageSize: safeSize,
    };
  } catch (err) {
    console.error('[db.getRegistrationsPaginated]', err);
    return { data: [], total: 0, page: safePage, pageSize: safeSize };
  }
}

export async function addRegistration(reg: Omit<Registration, 'id' | 'createdAt'>): Promise<Registration> {
  const isVerified = reg.status === 'Verified';
  const row: RegistrationRow = {
    id: shortId(),
    full_name: reg.fullName,
    email: reg.email,
    phone: reg.phone,
    status: reg.status,
    city: reg.city,
    created_at: new Date().toISOString(),
    whatsapp_status: reg.whatsappStatus ?? null,
    whatsapp_error: reg.whatsappError ?? null,
    verified_at: isVerified ? (reg.verifiedAt ?? new Date().toISOString()) : (reg.verifiedAt ?? null),
    attempt_number: reg.attemptNumber ?? 1,
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

// ─── Webinar config (dynamic LP) ─────────────────────────────────────────────

/**
 * Returns the full WebinarConfig (speaker fields + all dynamic webinar fields).
 * Any field that's null in the DB is null in the result — callers are expected
 * to supply hardcoded fallbacks at render time.
 */
export async function getWebinarConfig(): Promise<WebinarConfig> {
  try {
    const { data, error } = await client()
      .from('settings')
      .select('*')
      .eq('id', 'speaker')
      .maybeSingle<SettingsRow>();
    if (error) throw error;
    if (!data) {
      // No row yet — return speaker defaults + all dynamic fields null.
      return mapWebinarConfig({
        id: 'speaker',
        speaker_name: DEFAULT_SETTINGS.speakerName,
        speaker_title: DEFAULT_SETTINGS.speakerTitle,
        speaker_image: DEFAULT_SETTINGS.speakerImage,
        speaker_bio: DEFAULT_SETTINGS.speakerBio,
      });
    }
    return mapWebinarConfig(data);
  } catch (err) {
    console.error('[db.getWebinarConfig]', err);
    return mapWebinarConfig({
      id: 'speaker',
      speaker_name: DEFAULT_SETTINGS.speakerName,
      speaker_title: DEFAULT_SETTINGS.speakerTitle,
      speaker_image: DEFAULT_SETTINGS.speakerImage,
      speaker_bio: DEFAULT_SETTINGS.speakerBio,
    });
  }
}

export async function getFeatures(): Promise<Feature[]> {
  try {
    const { data, error } = await client()
      .from('features')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapFeature);
  } catch (err) {
    console.error('[db.getFeatures]', err);
    return [];
  }
}

export async function getAgendaItems(): Promise<AgendaItem[]> {
  try {
    const { data, error } = await client()
      .from('agenda_items')
      .select('*')
      .order('sort_order', { ascending: true });
    if (error) throw error;
    return (data ?? []).map(mapAgendaItem);
  } catch (err) {
    console.error('[db.getAgendaItems]', err);
    return [];
  }
}

/** Partial update of the singleton settings row (any subset of WebinarConfig). */
export async function updateWebinarConfig(
  patch: Partial<Omit<WebinarConfig, never>>,
): Promise<WebinarConfig> {
  const dbPatch: Record<string, unknown> = {};
  const set = <K extends keyof typeof patch>(key: K, column: string) => {
    if (key in patch && patch[key] !== undefined) dbPatch[column] = patch[key];
  };
  set('speakerName', 'speaker_name');
  set('speakerTitle', 'speaker_title');
  set('speakerImage', 'speaker_image');
  set('speakerBio', 'speaker_bio');
  set('webinarTitle', 'webinar_title');
  set('webinarSubtitle', 'webinar_subtitle');
  set('eyebrowText', 'eyebrow_text');
  set('webinarDateLabel', 'webinar_date_label');
  set('webinarTimeLabel', 'webinar_time_label');
  set('webinarDatetimeUtc', 'webinar_datetime_utc');
  set('durationLabel', 'duration_label');
  set('metaTitle', 'meta_title');
  set('metaDescription', 'meta_description');
  set('ogImageUrl', 'og_image_url');
  set('formHeading', 'form_heading');
  set('formSubheading', 'form_subheading');
  set('stickyEyebrow', 'sticky_eyebrow');
  set('stickyMain', 'sticky_main');
  set('ctaButtonText', 'cta_button_text');
  set('navCtaText', 'nav_cta_text');
  set('logoPath', 'logo_path');
  set('zoomWebinarId', 'zoom_webinar_id');
  set('lsqSourceName', 'lsq_source_name');
  set('whatsappTemplateName', 'whatsapp_template_name');
  set('heroStat1Value', 'hero_stat_1_value');
  set('heroStat1Label', 'hero_stat_1_label');
  set('heroStat2Value', 'hero_stat_2_value');
  set('heroStat2Label', 'hero_stat_2_label');
  set('heroStat3Value', 'hero_stat_3_value');
  set('heroStat3Label', 'hero_stat_3_label');
  set('showDefinitionSection', 'show_definition_section');
  set('definitionSectionTitle', 'definition_section_title');
  set('definitionIntro', 'definition_intro');
  set('definitionATitle', 'definition_a_title');
  set('definitionABody', 'definition_a_body');
  set('definitionBTitle', 'definition_b_title');
  set('definitionBBody', 'definition_b_body');
  set('agendaSectionTitle', 'agenda_section_title');
  set('agendaSectionSubtitle', 'agenda_section_subtitle');
  set('facultyIntro', 'faculty_intro');
  set('footerText', 'footer_text');
  // Phase 2
  set('heroEyebrowPill', 'hero_eyebrow_pill');
  set('heroH1Markup', 'hero_h1_markup');
  set('heroSubtitle', 'hero_subtitle');
  set('countdownLabel', 'countdown_label');
  set('urgencyBadgeText', 'urgency_badge_text');
  set('saveSpotCtaText', 'save_spot_cta_text');
  set('formPillDateLabel', 'form_pill_date_label');
  set('formPillSeatsLabel', 'form_pill_seats_label');
  set('formOtpFooterLabel', 'form_otp_footer_label');
  set('formBottomStat1Value', 'form_bottom_stat_1_value');
  set('formBottomStat1Label', 'form_bottom_stat_1_label');
  set('formBottomStat2Value', 'form_bottom_stat_2_value');
  set('formBottomStat2Label', 'form_bottom_stat_2_label');
  set('formBottomStat3Value', 'form_bottom_stat_3_value');
  set('formBottomStat3Label', 'form_bottom_stat_3_label');
  set('statsDisclaimer', 'stats_disclaimer');
  set('partnershipCaption', 'partnership_caption');
  set('partnershipImagePath', 'partnership_image_path');
  set('definitionEyebrow', 'definition_eyebrow');
  set('definitionABullets', 'definition_a_bullets');
  set('definitionBBullets', 'definition_b_bullets');
  set('featuresSectionTitle', 'features_section_title');
  set('featuresSectionSubtitle', 'features_section_subtitle');
  set('featuresImagePath', 'features_image_path');
  set('sessionInsidePill', 'session_inside_pill');
  set('sessionBadge1', 'session_badge_1');
  set('sessionBadge2', 'session_badge_2');
  set('sessionBadge3', 'session_badge_3');
  set('sessionObjEyebrow', 'session_obj_eyebrow');
  set('sessionObjTitle', 'session_obj_title');
  set('sessionObj1Num', 'session_obj_1_num');
  set('sessionObj1Title', 'session_obj_1_title');
  set('sessionObj1Desc', 'session_obj_1_desc');
  set('sessionObj2Num', 'session_obj_2_num');
  set('sessionObj2Title', 'session_obj_2_title');
  set('sessionObj2Desc', 'session_obj_2_desc');
  set('sessionWalkthroughEyebrow', 'session_walkthrough_eyebrow');
  set('sessionWalkthroughTitle', 'session_walkthrough_title');
  set('facultyHeadingPrefix', 'faculty_heading_prefix');
  set('faqSectionTitle', 'faq_section_title');
  // Phase 3
  set('footerLink1Label', 'footer_link_1_label');
  set('footerLink1Url', 'footer_link_1_url');
  set('footerLink2Label', 'footer_link_2_label');
  set('footerLink2Url', 'footer_link_2_url');
  set('footerLink3Label', 'footer_link_3_label');
  set('footerLink3Url', 'footer_link_3_url');
  set('footerLink4Label', 'footer_link_4_label');
  set('footerLink4Url', 'footer_link_4_url');
  set('formLabelName', 'form_label_name');
  set('formLabelEmail', 'form_label_email');
  set('formLabelPhone', 'form_label_phone');
  set('formLabelStatus', 'form_label_status');
  set('formLabelCity', 'form_label_city');
  set('formLabelReferral', 'form_label_referral');
  set('formPlaceholderName', 'form_placeholder_name');
  set('formPlaceholderEmail', 'form_placeholder_email');
  set('formPlaceholderPhone', 'form_placeholder_phone');
  set('formPlaceholderSelect', 'form_placeholder_select');
  set('formPlaceholderCity', 'form_placeholder_city');
  set('formStatusOptions', 'form_status_options');
  set('formReferralOptions', 'form_referral_options');
  set('otpHeading', 'otp_heading');
  set('otpSubtitleTemplate', 'otp_subtitle_template');
  set('otpEditDetailsLabel', 'otp_edit_details_label');
  set('otpVerifyButtonText', 'otp_verify_button_text');
  set('otpResendLabel', 'otp_resend_label');
  set('otpHelpText', 'otp_help_text');
  set('otpHelpWhatsappNumber', 'otp_help_whatsapp_number');
  set('successHeading', 'success_heading');
  set('successBody', 'success_body');
  set('facultyChip1', 'faculty_chip_1');
  set('facultyChip2', 'faculty_chip_2');
  set('facultyChip3', 'faculty_chip_3');
  set('partnershipImageAlt', 'partnership_image_alt');
  // Phase 4
  set('thankyouHeading', 'thankyou_heading');
  set('thankyouSubcopy', 'thankyou_subcopy');
  set('thankyouConfirmationTemplate', 'thankyou_confirmation_template');
  set('thankyouWebinarTitlePersonal', 'thankyou_webinar_title_personal');
  set('thankyouWebinarTitleDefault', 'thankyou_webinar_title_default');
  set('thankyouWebinarBodyPersonal', 'thankyou_webinar_body_personal');
  set('thankyouWebinarBodyDefault', 'thankyou_webinar_body_default');
  set('thankyouWebinarCtaPersonal', 'thankyou_webinar_cta_personal');
  set('thankyouWebinarCtaDefault', 'thankyou_webinar_cta_default');
  set('thankyouPhoneTitle', 'thankyou_phone_title');
  set('thankyouPhoneBody', 'thankyou_phone_body');
  set('thankyouPhoneCta', 'thankyou_phone_cta');
  set('thankyouPhoneNumber', 'thankyou_phone_number');
  set('thankyouWhatsappTitle', 'thankyou_whatsapp_title');
  set('thankyouWhatsappBody', 'thankyou_whatsapp_body');
  set('thankyouWhatsappCta', 'thankyou_whatsapp_cta');
  set('thankyouWhatsappNumber', 'thankyou_whatsapp_number');
  set('thankyouWhatsappMessage', 'thankyou_whatsapp_message');
  set('thankyouFooterText', 'thankyou_footer_text');
  set('genericBrochureUrl', 'generic_brochure_url');
  set('genericBrochureCta', 'generic_brochure_cta');

  if (Object.keys(dbPatch).length === 0) return getWebinarConfig();

  const { error } = await client()
    .from('settings')
    .update(dbPatch)
    .eq('id', 'speaker');
  if (error) throw error;
  return getWebinarConfig();
}

export type FeatureInput = {
  id?: string;
  icon?: string | null;
  title: string;
  description: string;
  accent?: string | null;
};

export async function replaceFeatures(items: FeatureInput[]): Promise<Feature[]> {
  const clean: FeatureRow[] = [];
  items.forEach((item, idx) => {
    const title = (item.title ?? '').toString().trim();
    const description = (item.description ?? '').toString().trim();
    if (!title || !description) return;
    if (title.length > 120 || description.length > 500) return;
    clean.push({
      id: item.id && typeof item.id === 'string' && !item.id.startsWith('new-') ? item.id : shortId(),
      icon: item.icon ? item.icon.toString().trim().slice(0, 40) : null,
      title,
      description,
      accent: item.accent === 'gold' ? 'gold' : null,
      sort_order: idx,
    });
  });

  const supabase = client();
  const { error: delError } = await supabase.from('features').delete().not('id', 'is', null);
  if (delError) throw delError;
  if (clean.length) {
    const { error: insError } = await supabase.from('features').insert(clean);
    if (insError) throw insError;
  }
  return clean.map(mapFeature);
}

export type AgendaItemInput = {
  id?: string;
  title: string;
  description: string;
  highlight?: boolean;
};

export async function replaceAgendaItems(items: AgendaItemInput[]): Promise<AgendaItem[]> {
  const clean: AgendaItemRow[] = [];
  items.forEach((item, idx) => {
    const title = (item.title ?? '').toString().trim();
    const description = (item.description ?? '').toString().trim();
    if (!title || !description) return;
    if (title.length > 200 || description.length > 1000) return;
    clean.push({
      id: item.id && typeof item.id === 'string' && !item.id.startsWith('new-') ? item.id : shortId(),
      title,
      description,
      highlight: !!item.highlight,
      sort_order: idx,
    });
  });

  const supabase = client();
  const { error: delError } = await supabase.from('agenda_items').delete().not('id', 'is', null);
  if (delError) throw delError;
  if (clean.length) {
    const { error: insError } = await supabase.from('agenda_items').insert(clean);
    if (insError) throw insError;
  }
  return clean.map(mapAgendaItem);
}

// ── admin_users ────────────────────────────────────────────────────────────

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  isActive: boolean;
  createdAt: string;
  createdBy: string | null;
  lastLoginAt: string | null;
}

export interface AdminUserWithHash extends AdminUser {
  passwordHash: string;
}

interface AdminUserRow {
  id: string;
  email: string;
  name: string | null;
  password_hash: string;
  is_active: boolean;
  created_at: string;
  created_by: string | null;
  last_login_at: string | null;
}

function mapAdmin(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    isActive: row.is_active,
    createdAt: row.created_at,
    createdBy: row.created_by,
    lastLoginAt: row.last_login_at,
  };
}

function mapAdminWithHash(row: AdminUserRow): AdminUserWithHash {
  return { ...mapAdmin(row), passwordHash: row.password_hash };
}

export async function listAdminUsers(): Promise<AdminUser[]> {
  const { data, error } = await client()
    .from('admin_users')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data as AdminUserRow[]).map(mapAdmin);
}

export async function getAdminByEmail(email: string): Promise<AdminUserWithHash | null> {
  const { data, error } = await client()
    .from('admin_users')
    .select('*')
    .ilike('email', email)
    .limit(1)
    .maybeSingle<AdminUserRow>();
  if (error) throw error;
  return data ? mapAdminWithHash(data) : null;
}

export async function getAdminByEmailActive(email: string): Promise<AdminUserWithHash | null> {
  const admin = await getAdminByEmail(email);
  return admin && admin.isActive ? admin : null;
}

export async function createAdminUser(input: {
  email: string;
  name: string | null;
  passwordHash: string;
  createdBy: string | null;
}): Promise<AdminUser> {
  const { data, error } = await client()
    .from('admin_users')
    .insert({
      email: input.email,
      name: input.name,
      password_hash: input.passwordHash,
      created_by: input.createdBy,
    })
    .select('*')
    .single<AdminUserRow>();
  if (error) throw error;
  return mapAdmin(data);
}

export async function updateAdminUser(
  id: string,
  patch: Partial<{ name: string | null; isActive: boolean; passwordHash: string }>,
): Promise<AdminUser> {
  const dbPatch: Record<string, unknown> = {};
  if (patch.name !== undefined) dbPatch.name = patch.name;
  if (patch.isActive !== undefined) dbPatch.is_active = patch.isActive;
  if (patch.passwordHash !== undefined) dbPatch.password_hash = patch.passwordHash;

  const { data, error } = await client()
    .from('admin_users')
    .update(dbPatch)
    .eq('id', id)
    .select('*')
    .single<AdminUserRow>();
  if (error) throw error;
  return mapAdmin(data);
}

export async function deleteAdminUser(id: string): Promise<void> {
  const { error } = await client().from('admin_users').delete().eq('id', id);
  if (error) throw error;
}

export async function touchAdminLastLogin(id: string): Promise<void> {
  const { error } = await client()
    .from('admin_users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', id);
  if (error) {
    // Non-critical — log but don't block login.
    console.error('[db.touchAdminLastLogin]', error);
  }
}

export async function countAdminUsers(): Promise<number> {
  const { count, error } = await client()
    .from('admin_users')
    .select('*', { count: 'exact', head: true });
  if (error) throw error;
  return count ?? 0;
}

