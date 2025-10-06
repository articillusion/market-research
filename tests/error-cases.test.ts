import request from 'supertest';
import app from '../src/server/app';

describe('Error cases', () => {
  it('rejects saving a questionnaire without id', async () => {
    const res = await request(app).post('/api/save-draft').send({ title: 'No ID' });
    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Validation failed');
  });

  it('returns 404 for non-existent questionnaire', async () => {
    const res = await request(app).get('/api/questionnaire/non-existent-id');
    expect(res.status).toBe(404);
  });
});
