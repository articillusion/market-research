import { IQuestionnaire } from '../models/Questionnaire';

type ParseInputs = { file?: Buffer | null; description?: string; userId?: string };

function makeId(prefix = '') {
  return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Minimal backend aiService stub used by controllers for now. Replace with full Copilot integration later.
export async function parseSowAndGenerate(inputs: ParseInputs): Promise<IQuestionnaire> {
  // For now, return a small stub to allow compilation and testing
  const now = new Date();
  return {
    id: makeId('s_'),
    title: inputs.description ? `AI: ${inputs.description.slice(0, 30)}` : 'AI Draft',
    clientName: 'Unknown',
    fieldworkMarket: ['US'],
    comissionMarket: ['US'],
    language: 'en-US',
    status: 'AI_Pending',
    createdAt: now,
    createdByUserId: inputs.userId || 'system',
    sections: [
      {
        id: 's1',
        title: 'Section 1',
        questions: [
          {
            id: 'q1',
            type: 'ScreenOut',
            text: 'Are you over 18? (AI stub)',
            options: [
              { label: 'Yes', value: 'yes' },
              { label: 'No', value: 'no' },
            ],
            logic: [{ type: 'ScreenOut', condition: "q1 == 'no'", targetId: '' }],
            labels: [],
            commentArea: false,
          },
        ],
      },
    ],
  } as IQuestionnaire;
}
