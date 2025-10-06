import prisma from './prismaClient';
import { IQuestionnaire } from '../models/Questionnaire';

const DEBUG = process.env.DEBUG === 'true' || process.env.DEBUG === '1';
function debugLog(...args: any[]) {
  if (DEBUG) {
    // Use console.debug so it's lower-noise than console.error
    console.debug('[debug] ', ...args);
  }
}

export async function saveQuestionnairePrisma(q: IQuestionnaire) {
  await prisma.questionnaire.upsert({
    where: { id: q.id },
    update: { json: JSON.stringify(q) },
    create: { id: q.id, json: JSON.stringify(q) }
  });
}

export async function getQuestionnairePrisma(id: string): Promise<IQuestionnaire | null> {
  const row = await prisma.questionnaire.findUnique({ where: { id } });
  if (!row) return null;
  return JSON.parse(row.json) as IQuestionnaire;
}

export async function listQuestionnairesPrisma(): Promise<IQuestionnaire[]> {
  const rows = await prisma.questionnaire.findMany();
  return rows.map((r: { json: string | unknown }) => {
    // Prisma may return the `json` column as a string or already-parsed value
    const raw = (r as any).json;
    if (typeof raw === 'string') {
      try {
        return JSON.parse(raw) as IQuestionnaire;
      } catch (err) {
        debugLog('db_prisma: failed to parse questionnaire json', err, raw);
        // Fallback: attempt coercion
        return JSON.parse(String(raw)) as IQuestionnaire;
      }
    }
    return raw as IQuestionnaire;
  });
}
