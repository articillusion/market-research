import prisma from './prismaClient';
import { IQuestionnaire } from '../models/Questionnaire';

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
  return rows.map((r) => JSON.parse(r.json) as IQuestionnaire);
}
