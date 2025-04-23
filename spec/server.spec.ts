import request from 'supertest';
import { app } from '../src/server';
import path from 'path';
import * as fs from 'fs/promises';
import axios from 'axios';
import jasmine from 'jasmine';

describe('Server API Endpoints', () => {
  describe('GET /api/:width/:height', () => {
    it('should serve cached image if exists', async () => {
      const width = '100';
      const height = '100';
      const imagePath = path.join(process.cwd(), 'images', `${width}x${height}.jpg`);
      const fakeImageBuffer = Buffer.from('fake image data');

      spyOn(fs, 'access').and.returnValue(Promise.resolve());
      spyOn(fs, 'readFile').and.returnValue(Promise.resolve(fakeImageBuffer));

      const res = await request(app).get(`/api/${width}/${height}`);

      expect(fs.access).toHaveBeenCalledWith(imagePath);
      expect(fs.readFile).toHaveBeenCalledWith(imagePath);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/jpg');
      expect(res.body).toEqual(fakeImageBuffer);
    });

    it('should fetch image if not cached and save it', async () => {
      const width = '200';
      const height = '200';
      const imagePath = path.join(process.cwd(), 'images', `${width}x${height}.jpg`);
      const fakeImageBuffer = Buffer.from('fetched image data');

      spyOn(fs, 'access').and.returnValue(Promise.reject(new Error('File not found')));
      spyOn(axios, 'get').and.returnValue(Promise.resolve({ data: fakeImageBuffer }));
      spyOn(fs, 'writeFile').and.returnValue(Promise.resolve());

      const res = await request(app).get(`/api/${width}/${height}`);

      expect(fs.access).toHaveBeenCalledWith(imagePath);
      expect(axios.get).toHaveBeenCalledWith(`https://picsum.photos/${width}/${height}`, { responseType: 'arraybuffer' });
      expect(fs.writeFile).toHaveBeenCalledWith(imagePath, fakeImageBuffer);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/jpg');
      expect(res.body).toEqual(fakeImageBuffer);
    });

    it('should return 500 if fetching image fails', async () => {
      const width = '300';
      const height = '300';

      spyOn(fs, 'access').and.returnValue(Promise.reject(new Error('File not found')));
      spyOn(axios, 'get').and.returnValue(Promise.reject(new Error('Network error')));

      const res = await request(app).get(`/api/${width}/${height}`);

      expect(res.status).toBe(500);
      expect(res.text).toBe('Error fetching the image');
    });
  });

  describe('GET /api/images', () => {
    it('should return list of images', async () => {
      const fakeFiles = ['1.jpg', '2.jpg'];
      spyOn(fs, 'readdir').and.returnValue(Promise.resolve(fakeFiles) as any);

      const res = await request(app).get('/api/images');

      expect(fs.readdir).toHaveBeenCalledWith(path.join(process.cwd(), 'images'),jasmine.anything());
      expect(res.status).toBe(200);
      expect(res.body).toEqual(fakeFiles.map(file => ({ filename: file })));
    });

    it('should return 500 if reading directory fails', async () => {
      spyOn(fs, 'readdir').and.returnValue(Promise.reject(new Error('Failed to read')) as any);

      const res = await request(app).get('/api/images');

      expect(res.status).toBe(500);
      expect(res.body).toEqual({ error: 'Failed to read images directory' });
    });
  });

  describe('POST /api/upload', () => {
    it('should return 400 if no file uploaded', async () => {
      const res = await request(app).post('/api/upload');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'No file uploaded' });
    });

    /*
    // Note: Testing file upload with multer requires integration testing or more complex mocking.
    // Here we test the happy path assuming multer works correctly.
    it('should return filename if file uploaded', async () => {
      // This test requires integration or e2e testing with actual file upload.
      // Placeholder for future implementation.
    });
    */
  });
});
