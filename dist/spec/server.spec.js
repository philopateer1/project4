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
const path_1 = __importDefault(require("path"));
const imageProcessor_1 = require("../imageProcessor");
const server_1 = require("../server");
const fs = __importStar(require("fs/promises"));
describe('Server API Endpoints', () => {
    const testImagePath = path_1.default.join(process.cwd(), 'images', 'test-resized.jpg');
    beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up test image before tests
        try {
            yield fs.unlink(testImagePath);
        }
        catch (_a) { }
    }));
    afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
        // Clean up test image after tests
        try {
            yield fs.unlink(testImagePath);
        }
        catch (_a) { }
    }));
    describe('GET /api/:width/:height', () => {
        it('should fetch, cache and serve an image', () => __awaiter(void 0, void 0, void 0, function* () {
            const width = '100';
            const height = '100';
            const imagePath = path_1.default.join(process.cwd(), 'images', `${width}x${height}.jpg`);
            // Clean up cached image before test
            try {
                yield fs.unlink(imagePath);
            }
            catch (_a) { }
            const res = yield (0, supertest_1.default)(server_1.app).get(`/api/${width}/${height}`);
            expect(res.status).toBe(200);
            expect(res.headers['content-type']).toBe('image/jpg');
            expect(res.body.length).toBeGreaterThan(0);
            // Check that the image file was saved
            const stat = yield fs.stat(imagePath);
            expect(stat.isFile()).toBeTrue();
            expect(stat.size).toBeGreaterThan(0);
            // Clean up cached image after test
            yield fs.unlink(imagePath);
        }));
    });
    describe('GET /api/images', () => {
        it('should return list of images', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.app).get('/api/images');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBeTrue();
            if (res.body.length > 0) {
                expect(res.body[0].filename).toBeDefined();
            }
        }));
    });
    describe('POST /api/upload', () => {
        it('should return 400 if no file uploaded', () => __awaiter(void 0, void 0, void 0, function* () {
            const res = yield (0, supertest_1.default)(server_1.app).post('/api/upload');
            expect(res.status).toBe(400);
            expect(res.body).toEqual({ error: 'No file uploaded' });
        }));
    });
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
