import request from 'supertest';
import path from 'path';
import axios from 'axios';
import { resizeImage } from '../imageProcessor';
import { app } from '../server';
import * as fs from 'fs/promises';

describe('Server API Endpoints', () => {
  const testImagePath = path.join(process.cwd(), 'images', 'test-resized.jpg');

  beforeAll(async () => {
    // Clean up test image before tests
    try {
      await fs.unlink(testImagePath);
    } catch {}
  });

  afterAll(async () => {
    // Clean up test image after tests
    try {
      await fs.unlink(testImagePath);
    } catch {}
  });

  describe('GET /api/:width/:height', () => {
    it('should fetch, cache and serve an image', async () => {
      const width = '100';
      const height = '100';
      const imagePath = path.join(process.cwd(), 'images', `${width}x${height}.jpg`);

      // Clean up cached image before test
      try {
        await fs.unlink(imagePath);
      } catch {}

      const res = await request(app).get(`/api/${width}/${height}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('image/jpg');
      expect(res.body.length).toBeGreaterThan(0);

      // Check that the image file was saved
      const stat = await fs.stat(imagePath);
      expect(stat.isFile()).toBeTrue();
      expect(stat.size).toBeGreaterThan(0);

      // Clean up cached image after test
      await fs.unlink(imagePath);
    });
  });

  describe('GET /api/images', () => {
    it('should return list of images', async () => {
      const res = await request(app).get('/api/images');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBeTrue();
      if (res.body.length > 0) {
        expect(res.body[0].filename).toBeDefined();
      }
    });
  });

  describe('POST /api/upload', () => {
    it('should return 400 if no file uploaded', async () => {
      const res = await request(app).post('/api/upload');

      expect(res.status).toBe(400);
      expect(res.body).toEqual({ error: 'No file uploaded' });
    });
  });
});

describe('resizeImage function', () => {
  const inputImage = path.join(process.cwd(), 'images', '300x300.jpg');
  const outputImage = path.join(process.cwd(), 'images', 'test-resized.jpg');

  afterEach(async () => {
    // Clean up output file after each test
    try {
      await fs.unlink(outputImage);
    } catch {}
  });

  it('should resize the image and save to output path', async () => {
    const width = 100;
    const height = 100;

    await resizeImage(inputImage, outputImage, width, height);

    const stat = await fs.stat(outputImage);
    expect(stat.isFile()).toBeTrue();
    expect(stat.size).toBeGreaterThan(0);
  });

  it('should throw an error for invalid input path', async () => {
    const invalidInput = path.join(process.cwd(), 'images', 'nonexistent.jpg');
    const width = 100;
    const height = 100;

    await expectAsync(resizeImage(invalidInput, outputImage, width, height)).toBeRejectedWithError();
  });
});
