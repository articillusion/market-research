import axios from 'axios';
import { SurveyDraft } from '../components/QuestionnaireBuilder';

export class AiService {
  async interactWithKoncierge(surveyId: string, formData: FormData): Promise<{ message: string; survey?: SurveyDraft }> {
    try {
      const response = await axios.post('/api/koncierge', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (err) {
      throw new Error('Failed to interact with Koncierge');
    }
  }
}

export const aiService = new AiService();
