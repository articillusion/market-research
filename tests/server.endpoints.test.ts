import request from 'supertest';
import app from '../src/server/app';

describe('Server endpoints', () => {
  it('GET / returns API running', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('Market Research API is running.');
  });
});
