"use strict";
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
const express_1 = __importDefault(require("express"));
const axios_1 = __importDefault(require("axios"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Serve static files from public directory
app.use(express_1.default.static(path_1.default.join(__dirname, "public")));
// Serve images statically from /images route
app.use('/images', express_1.default.static(path_1.default.join(process.cwd(), 'images')));
app.get("/api/:width/:height", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let width = req.params.width;
    let height = req.params.height;
    let url = `https://picsum.photos/${width}/${height}`;
    const imagesDir = path_1.default.join(process.cwd(), 'images');
    yield fs_1.promises.mkdir(imagesDir, { recursive: true });
    const imagePath = path_1.default.join(imagesDir, `${width}x${height}.jpg`);
    try {
        // Check if cached image exists
        yield fs_1.promises.access(imagePath);
        // If exists, read and serve it
        const cachedImage = yield fs_1.promises.readFile(imagePath);
        res.writeHead(200, {
            'Content-Type': 'image/jpg',
            'Content-Length': cachedImage.length,
        });
        res.end(cachedImage);
    }
    catch (_a) {
        // If not exists, fetch from picsum.photos
        try {
            const response = yield axios_1.default.get(url, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');
            yield fs_1.promises.writeFile(imagePath, imageBuffer);
            res.writeHead(200, {
                'Content-Type': 'image/jpg',
                'Content-Length': imageBuffer.length,
            });
            res.end(imageBuffer);
        }
        catch (error) {
            res.status(500).send('Error fetching the image');
        }
    }
}));
app.get("/api/images", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const imagesDir = path_1.default.join(process.cwd(), 'images');
        const files = yield fs_1.promises.readdir(imagesDir);
        // Return array of objects with filename only for now
        const response = files.map(file => ({ filename: file }));
        res.json(response);
    }
    catch (error) {
        res.status(500).json({ error: "Failed to read images directory" });
    }
}));
const multer_1 = __importDefault(require("multer"));
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(process.cwd(), 'images'));
    },
    filename: function (req, file, cb) {
        const name = file.originalname.split(".")[0];
        cb(null, name + ".jpg");
    }
});
const upload = (0, multer_1.default)({ storage: storage });
app.post("/api/upload", upload.single("photo"), (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.file) {
        res.status(400).json({ error: "No file uploaded" });
        return;
    }
    // After upload, optionally resize the image to a default size or keep original
    // For now, just respond with filename
    res.json({ filename: req.file.filename });
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
