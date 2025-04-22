var request = require('supertest');
var server = require('../src/server');

describe('Express API Endpoints', () => {
  let server;

  beforeAll((done) => {
    server = listen(4000, done);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('GET /api/images', () => {
    it('should return a list of image filenames', async () => {
      const res = await request(server).get('/api/images');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('POST /api/upload', () => {
    it('should upload a jpg image and return filename', async () => {
      const res = await request(server)
        .post('/api/upload')
        .attach('photo', Buffer.from([0xff, 0xd8, 0xff, 0xd9]), 'test.jpg');

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('filename');
      expect(typeof res.body.filename).toBe('string');
    });

    it('should return 400 if no file uploaded', async () => {
      const res = await request(server).post('/api/upload');
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error', 'No file uploaded');
    });
  });

  describe('GET /api/:width/:height', () => {
    it('should return an image with given width and height', async () => {
      const width = 100;
      const height = 100;
      const res = await request(server).get(`/api/${width}/${height}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/jpg');
      expect(res.body).toBeInstanceOf(Buffer);
    });
  });
});
