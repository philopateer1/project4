import express from "express";
import axios from "axios";
import {promises as fs} from "fs";
import path from "path";
import cors from "cors";

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json())
app.use(express.static(path.join(__dirname,"public")));

//generate images with width and height
app.get("/api/:width/:height",async (req,res)=>{
    let width = req.params.width;
    let height = req.params.height;
    let url = `https://picsum.photos/${width}/${height}`;
    
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data, 'binary');

    const imagesDir = path.join(process.cwd(), 'images');
        await fs.mkdir(imagesDir, { recursive: true });
    const timestamp = Date.now();
    const imagePath = path.join(process.cwd(),'images', `${width}x${height}-${timestamp}.jpg`);
        await fs.writeFile(imagePath, imageBuffer);
    try {
        res.writeHead(200, {
            'Content-Type': 'image/jpg',
            'Content-Length': imageBuffer.length,
        });
        res.end(imageBuffer);
    } catch (error) {
        res.status(500).send('Error fetching the image');
    }
});

app.get("/api/images", async (req, res) => {
    try {
        const imagesDir = path.join(process.cwd(), 'images');
        const files = await fs.readdir(imagesDir);
        res.json(files);
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
    const name = file.originalname.split(".")[0]+ `-${Date.now()}`;

    cb(null, name + ".jpg");
  }
});

const upload = multer({ storage: storage });

import { Request, Response, NextFunction } from "express";

app.post("/api/upload", upload.single("photo"), (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }
  res.json({ filename: req.file.filename });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});