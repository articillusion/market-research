"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const AIGenerationService_1 = require("../services/AIGenerationService");
const validation_1 = require("./validation");
// Use Prisma-backed DB (migration applied)
const prismaModule = require('./db_prisma');
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Endpoint to generate a questionnaire draft from uploaded files (mocked for now)
app.post('/api/generate-draft', async (req, res) => {
    const sowFileBuffer = Buffer.from('');
    const proposalFileBuffer = Buffer.from('');
    const userId = req.body.userId || 'mock-user';
    const aiService = new AIGenerationService_1.AIGenerationService();
    const draft = await aiService.generateDraftFromFiles(sowFileBuffer, proposalFileBuffer, userId);
    res.json(draft);
});
app.post('/api/save-draft', async (req, res) => {
    try {
        const questionnaire = req.body;
        // Validation
        const errors = (0, validation_1.validateQuestionnaire)(questionnaire);
        if (errors.length > 0) {
            return res.status(400).json({ error: 'Validation failed', details: errors });
        }
        await prismaModule.saveQuestionnairePrisma(questionnaire);
        return res.json({ saved: true, questionnaire });
    }
    catch (err) {
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
    }
    catch (err) {
        console.error('List failed', err);
        return res.status(500).json({ error: 'Failed to list questionnaires' });
    }
});
app.get('/api/questionnaire/:id', async (req, res) => {
    try {
        const q = await prismaModule.getQuestionnairePrisma(req.params.id);
        if (!q)
            return res.status(404).json({ error: 'Not found' });
        return res.json(q);
    }
    catch (err) {
        console.error('Get failed', err);
        return res.status(500).json({ error: 'Failed to retrieve questionnaire' });
    }
});
exports.default = app;
