import request from 'supertest';
import app from '../src/server/app';

describe('Validation tests', () => {
  it('rejects missing title', async () => {
    const q = { id: 'x', clientName: 'c', sections: [] };
    const res = await request(app).post('/api/save-draft').send(q);
    expect(res.status).toBe(400);
  });

  it('rejects invalid sections', async () => {
    const q = { id: 'x2', title: 't', clientName: 'c', sections: [{ title: 'no id' }] };
    const res = await request(app).post('/api/save-draft').send(q);
    expect(res.status).toBe(400);
  });
});
