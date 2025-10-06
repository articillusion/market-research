import { IQuestionnaire } from '../models/Questionnaire';

// Minimal survey service for saving/loading drafts. Replace with DB-backed implementation later.
export async function saveSurveyDraft(draft: IQuestionnaire): Promise<IQuestionnaire> {
  // No-op persistence for now; in prod, use SurveyModel.create/update
  // Attach a version or updatedAt metadata
  return { ...draft };
}

export async function loadSurveyDraft(id: string): Promise<IQuestionnaire | null> {
  return null;
}
