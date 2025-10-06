import request from 'supertest';
import app from '../src/server/app';

describe('Persistence flow', () => {
  it('generates a draft, saves it, and can retrieve it', async () => {
    const genRes = await request(app).post('/api/generate-draft').send({ userId: 'flow-user' });
    expect(genRes.status).toBe(200);
    const q = genRes.body;
    expect(q).toBeDefined();
    expect(q.id).toBeDefined();

  const saveRes = await request(app).post('/api/save-draft').send(q);
  expect(saveRes.status).toBe(200);
  expect(saveRes.body.saved).toBe(true);

  // Debugging: fetch list to ensure the store contains the id
  const listRes = await request(app).get('/api/questionnaires');
  expect(listRes.status).toBe(200);
  const ids = listRes.body.map((x: any) => x.id);
  // console.log('Generated id:', q.id, 'Store ids:', ids);
  expect(ids).toContain(q.id);

  const getRes = await request(app).get(`/api/questionnaire/${q.id}`);
  expect(getRes.status).toBe(200);
  expect(getRes.body.id).toBe(q.id);
  });
});
