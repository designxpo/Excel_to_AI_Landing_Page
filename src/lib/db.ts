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

export interface DbSchema {
  settings: SpeakerSettings;
  registrations: Registration[];
}

export function getDb(): DbSchema {
  try {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading DB:', error);
    return {
      settings: {
        speakerName: "Sumeet Singh",
        speakerTitle: "Co-founder & Chief Learning Officer",
        speakerImage: "/brand/avatar-piyush.png",
        speakerBio: "A pioneer in AI and Data Science education in India. Ex-McKinsey & ZS Associates."
      },
      registrations: []
    };
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

export function addRegistration(reg: Omit<Registration, 'id' | 'createdAt'>) {
  const db = getDb();
  const newReg: Registration = {
    ...reg,
    id: Math.random().toString(36).substr(2, 9),
    createdAt: new Date().toISOString()
  };
  db.registrations.unshift(newReg);
  saveDb(db);
  return newReg;
}
