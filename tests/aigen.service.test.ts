import { AIGenerationService } from '../src/services/AIGenerationService';

describe('AIGenerationService', () => {
  it('generates a mock questionnaire', async () => {
    const svc = new AIGenerationService();
    const q = await svc.generateDraftFromFiles(Buffer.from(''), Buffer.from(''), 'test-user');
    expect(q).toBeDefined();
    expect(q.id).toMatch(/^mock-/);
    expect(q.sections.length).toBeGreaterThan(0);
  });
});
