import express from 'express';
import cors from 'cors';
import { AIGenerationService } from '../services/AIGenerationService';
import { IQuestionnaire } from '../models/Questionnaire';
import { validateQuestionnaire } from './validation';

// Use Prisma-backed DB (migration applied)
const prismaModule = require('./db_prisma');

const app = express();

app.use(cors());
app.use(express.json());

// Endpoint to generate a questionnaire draft from uploaded files (mocked for now)
app.post('/api/generate-draft', async (req, res) => {
  const sowFileBuffer = Buffer.from('');
  const proposalFileBuffer = Buffer.from('');
  const userId = req.body.userId || 'mock-user';

  const aiService = new AIGenerationService();
  const draft: IQuestionnaire = await aiService.generateDraftFromFiles(sowFileBuffer, proposalFileBuffer, userId);
  res.json(draft);
});

app.post('/api/save-draft', async (req, res) => {
  try {
    const questionnaire: IQuestionnaire = req.body;
    // Validation
    const errors: string[] = validateQuestionnaire(questionnaire);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }

    await prismaModule.saveQuestionnairePrisma(questionnaire);
    return res.json({ saved: true, questionnaire });
  } catch (err) {
    console.error('Save failed', err);
    return res.status(500).json({ error: 'Failed to save questionnaire' });
  }
});

app.get('/', (req, res) => {
  res.send('Market Research API is running.');
});

app.get('/api/questionnaires', async (req, res) => {
  try {
    const list = await prismaModule.listQuestionnairesPrisma();
    return res.json(list);
  } catch (err) {
    console.error('List failed', err);
    return res.status(500).json({ error: 'Failed to list questionnaires' });
  }
});

app.get('/api/questionnaire/:id', async (req, res) => {
  try {
    const q = await prismaModule.getQuestionnairePrisma(req.params.id);
    if (!q) return res.status(404).json({ error: 'Not found' });
    return res.json(q);
  } catch (err) {
    console.error('Get failed', err);
    return res.status(500).json({ error: 'Failed to retrieve questionnaire' });
  }
});

export default app;

// Also expose CommonJS export for environments that require it
// (some test runners or scripts may use require(...) to load this file)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(module as any).exports = app;
