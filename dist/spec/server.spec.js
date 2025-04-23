"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = require("../server");
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const imageProcessor_1 = require("../imageProcessor");
const fs = __importStar(require("fs/promises"));
describe('Server API Endpoints', () => {
    // Patch fs/promises methods with spies
    beforeAll(() => {
        spyOn(fs, 'access').and.callFake(() => Promise.resolve());
        spyOn(fs, 'readFile').and.callFake(() => Promise.resolve(Buffer.from('fake image data')));
        spyOn(fs, 'writeFile').and.callFake(() => Promise.resolve());
        spyOn(fs, 'readdir').and.callFake(() => Promise.resolve(['1.jpg', '2.jpg']));
        spyOn(fs, 'unlink').and.callFake(() => Promise.resolve());
        spyOn(fs, 'stat').and.callFake(() => Promise.resolve({ isFile: () => true, size: 12345 }));
    });
    afterAll(() => {
        // Restore original implementations
        fs.access.and.callThrough();
        fs.readFile.and.callThrough();
        fs.writeFile.and.callThrough();
        fs.readdir.and.callThrough();
        fs.unlink.and.callThrough();
        fs.stat.and.callThrough();
    });
    describe('Server API Endpoints', () => {
        describe('GET /api/:width/:height', () => {
            it('should serve cached image if exists', () => __awaiter(void 0, void 0, void 0, function* () {
                const width = '100';
                const height = '100';
                const imagePath = path_1.default.join(process.cwd(), 'images', `${width}x${height}.jpg`);
                const fakeImageBuffer = Buffer.from('fake image data');
                fs.access.and.returnValue(Promise.resolve());
                fs.readFile.and.returnValue(Promise.resolve(fakeImageBuffer));
                const res = yield (0, supertest_1.default)(server_1.app).get(`/api/${width}/${height}`);
                expect(fs.access).toHaveBeenCalledWith(imagePath);
                expect(fs.readFile).toHaveBeenCalledWith(imagePath);
                expect(res.status).toBe(200);
                expect(res.headers['content-type']).toBe('image/jpg');
                expect(res.body).toEqual(fakeImageBuffer);
            }));
            it('should fetch image if not cached and save it', () => __awaiter(void 0, void 0, void 0, function* () {
                const width = '200';
                const height = '200';
                const imagePath = path_1.default.join(process.cwd(), 'images', `${width}x${height}.jpg`);
                const fakeImageBuffer = Buffer.from('fetched image data');
                fs.access.and.returnValue(Promise.reject(new Error('File not found')));
                spyOn(axios_1.default, 'get').and.returnValue(Promise.resolve({ data: fakeImageBuffer }));
                fs.writeFile.and.returnValue(Promise.resolve());
                const res = yield (0, supertest_1.default)(server_1.app).get(`/api/${width}/${height}`);
                expect(fs.access).toHaveBeenCalledWith(imagePath);
                expect(axios_1.default.get).toHaveBeenCalledWith(`https://picsum.photos/${width}/${height}`, { responseType: 'arraybuffer' });
                expect(fs.writeFile).toHaveBeenCalledWith(imagePath, fakeImageBuffer);
                expect(res.status).toBe(200);
                expect(res.headers['content-type']).toBe('image/jpg');
                expect(res.body).toEqual(fakeImageBuffer);
            }));
            it('should return 500 if fetching image fails', () => __awaiter(void 0, void 0, void 0, function* () {
                const width = '300';
                const height = '300';
                fs.access.and.returnValue(Promise.reject(new Error('File not found')));
                spyOn(axios_1.default, 'get').and.returnValue(Promise.reject(new Error('Network error')));
                const res = yield (0, supertest_1.default)(server_1.app).get(`/api/${width}/${height}`);
                expect(res.status).toBe(500);
                expect(res.text).toBe('Error fetching the image');
            }));
            it('should fetch, cache and serve a real image', () => __awaiter(void 0, void 0, void 0, function* () {
                const width = '350';
                const height = '350';
                const imagePath = path_1.default.join(process.cwd(), 'images', `${width}x${height}.jpg`);
                // Clean up before test if file exists
                try {
                    yield fs.unlink(imagePath);
                }
                catch (_a) { }
                const res = yield (0, supertest_1.default)(server_1.app).get(`/api/${width}/${height}`);
                expect(res.status).toBe(200);
                expect(res.headers['content-type']).toBe('image/jpg');
                expect(res.body.length).toBeGreaterThan(0);
                // Check that the image file was saved
                fs.stat.and.returnValue(Promise.resolve({ isFile: () => true, size: 12345 }));
                const fileStat = yield fs.stat(imagePath);
                expect(fileStat.isFile()).toBeTrue();
                expect(fileStat.size).toBeGreaterThan(0);
                // Clean up after test
                yield fs.unlink(imagePath);
            }));
        });
        describe('GET /api/images', () => {
            it('should return list of images', () => __awaiter(void 0, void 0, void 0, function* () {
                const fakeFiles = ['1.jpg', '2.jpg'];
                fs.readdir.and.returnValue(Promise.resolve(fakeFiles));
                const res = yield (0, supertest_1.default)(server_1.app).get('/api/images');
                expect(res.status).toBe(200);
                expect(res.body).toEqual(fakeFiles.map(file => ({ filename: file })));
            }));
            it('should return 500 if reading directory fails', () => __awaiter(void 0, void 0, void 0, function* () {
                fs.readdir.and.returnValue(Promise.reject(new Error('Failed to read')));
                const res = yield (0, supertest_1.default)(server_1.app).get('/api/images');
                expect(res.status).toBe(500);
                expect(res.body).toEqual({ error: 'Failed to read images directory' });
            }));
        });
        describe('POST /api/upload', () => {
            it('should return 400 if no file uploaded', () => __awaiter(void 0, void 0, void 0, function* () {
                const res = yield (0, supertest_1.default)(server_1.app).post('/api/upload');
                expect(res.status).toBe(400);
                expect(res.body).toEqual({ error: 'No file uploaded' });
            }));
        });
        describe('resizeImage function', () => {
            const inputImage = path_1.default.join(process.cwd(), 'images', '300x300.jpg');
            const outputImage = path_1.default.join(process.cwd(), 'images', 'test-resized.jpg');
            afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
                // Clean up output file after each test
                try {
                    yield fs.unlink(outputImage);
                }
                catch (_a) { }
            }));
            it('should resize the image and save to output path', () => __awaiter(void 0, void 0, void 0, function* () {
                const width = 100;
                const height = 100;
                yield (0, imageProcessor_1.resizeImage)(inputImage, outputImage, width, height);
                const stat = yield fs.stat(outputImage);
                expect(stat.isFile()).toBeTrue();
                expect(stat.size).toBeGreaterThan(0);
            }));
            it('should throw an error for invalid input path', () => __awaiter(void 0, void 0, void 0, function* () {
                const invalidInput = path_1.default.join(process.cwd(), 'images', 'nonexistent.jpg');
                const width = 100;
                const height = 100;
                yield expectAsync((0, imageProcessor_1.resizeImage)(invalidInput, outputImage, width, height)).toBeRejectedWithError();
            }));
        });
    });
});
