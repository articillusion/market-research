import { Request, Response } from 'express';
import { parseSowAndGenerate } from '../services/aiService';
import { saveSurveyDraft } from '../services/surveyService';

// POST /api/ai/generate
export async function generateFromSow(req: Request, res: Response) {
  try {
    // Expect multipart/form-data with file upload or JSON with description
    const { description } = req.body as { description?: string };
    const file = (req as any).file; // multer middleware will populate

    const result = await parseSowAndGenerate({ file, description, userId: req.user?.id });

    // Save as draft (non-published)
    const saved = await saveSurveyDraft(result);

    res.json({ ok: true, survey: saved });
  } catch (err: any) {
    console.error('AI generate error', err?.message || err);
    res.status(500).json({ ok: false, error: err?.message || 'AI generation failed' });
  }
}

export default { generateFromSow };
