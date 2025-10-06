import path from 'path';
import fs from 'fs';
import { IQuestionnaire } from '../models/Questionnaire';

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.join(DATA_DIR, 'questionnaires.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) fs.writeFileSync(STORE_FILE, JSON.stringify({}), 'utf8');
}

ensureDataDir();

function readStore(): Record<string, IQuestionnaire> {
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    return JSON.parse(raw || '{}');
  } catch (err) {
    return {};
  }
}

function writeStore(store: Record<string, IQuestionnaire>) {
  fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export function saveQuestionnaire(q: IQuestionnaire) {
  // Always persist to JSON store. Prisma-backed persistence is handled by app.ts when available.
  const store = readStore();
  store[q.id] = q;
  writeStore(store);
  try {
    const keys = Object.keys(readStore());
    console.error('JSON store saved id:', q.id, 'current ids:', keys);
  } catch (e) {
    console.error('Failed to read store for debug', e);
  }
}

export function getQuestionnaire(id: string): IQuestionnaire | null {
  const store = readStore();
  return store[id] || null;
}

export function listQuestionnaires(): IQuestionnaire[] {
  const store = readStore();
  return Object.values(store);
}

export default {
  saveQuestionnaire,
  getQuestionnaire,
  listQuestionnaires
};
