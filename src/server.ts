import express from "express";
import axios from "axios";
import {promises as fs} from "fs";
import path from "path";
import cors from "cors";
import { resizeImage } from './imageProcessor';

export const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())
// Serve static files from public directory
app.use(express.static(path.join(__dirname,"public")))
// Serve images statically from /images route
app.use('/images', express.static(path.join(process.cwd(),'images')));

app.get("/api/:width/:height", async (req, res) => {
    let width = req.params.width;
    let height = req.params.height;
    let url = `https://picsum.photos/${width}/${height}`;

    const imagesDir = path.join(process.cwd(), 'images');
    await fs.mkdir(imagesDir, { recursive: true });

    const imagePath = path.join(imagesDir, `${width}x${height}.jpg`);

    try {
        // Check if cached image exists
        await fs.access(imagePath);
        // If exists, read and serve it
        const cachedImage = await fs.readFile(imagePath);
        res.writeHead(200, {
            'Content-Type': 'image/jpg',
            'Content-Length': cachedImage.length,
        });
        res.end(cachedImage);
    } catch {
        // If not exists, fetch from picsum.photos
        try {
            const response = await axios.get(url, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(response.data, 'binary');
            await fs.writeFile(imagePath, imageBuffer);
            res.writeHead(200, {
                'Content-Type': 'image/jpg',
                'Content-Length': imageBuffer.length,
            });
            res.end(imageBuffer);
        } catch (error) {
            res.status(500).send('Error fetching the image');
        }
    }
});

app.get("/api/images", async (req, res) => {
    try {
        const imagesDir = path.join(process.cwd(), 'images');
        const files = await fs.readdir(imagesDir);
        // Return array of objects with filename only for now
        const response = files.map(file => ({ filename: file }));
        res.json(response);
    } catch (error) {
        res.status(500).json({ error: "Failed to read images directory" });
    }
});

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'images'));
  },
  filename: function (req, file, cb) {
    const name = file.originalname.split(".")[0];

    cb(null, name + ".jpg");
  }
});

const upload = multer({ storage: storage });

import { Request, Response, NextFunction } from "express";

app.post("/api/upload", upload.single("photo"), async (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  // After upload, optionally resize the image to a default size or keep original
  // For now, just respond with filename
  res.json({ filename: req.file.filename });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
