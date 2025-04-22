'use strict';
const __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	function adopt(value) {
		return value instanceof P
			? value
			: new P(resolve => {
				resolve(value);
			});
	}

	return new (P ||= Promise)((resolve, reject) => {
		function fulfilled(value) {
			try {
				step(generator.next(value));
			} catch (e) {
				reject(e);
			}
		}

		function rejected(value) {
			try {
				step(generator.throw(value));
			} catch (e) {
				reject(e);
			}
		}

		function step(result) {
			result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
		}

		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};

const __importDefault = (this && this.__importDefault) || function (mod) {
	return (mod && mod.__esModule) ? mod : {default: mod};
};

Object.defineProperty(exports, '__esModule', {value: true});
const express_1 = __importDefault(require('express'));
const axios_1 = __importDefault(require('axios'));
const fs_1 = require('fs');
const path_1 = __importDefault(require('path'));
const cors_1 = __importDefault(require('cors'));
const app = (0, express_1.default)();
const port = 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.static(path_1.default.join(__dirname, 'public')));
// Generate images with width and height
app.get('/api/:width/:height', (req, res) => __awaiter(void 0, void 0, void 0, function * () {
	const {width} = req.params;
	const {height} = req.params;
	const url = `https://picsum.photos/${width}/${height}`;
	const response = yield axios_1.default.get(url, {responseType: 'arraybuffer'});
	const imageBuffer = Buffer.from(response.data, 'binary');
	const imagesDir = path_1.default.join(process.cwd(), 'images');
	yield fs_1.promises.mkdir(imagesDir, {recursive: true});
	const timestamp = Date.now();
	const imagePath = path_1.default.join(process.cwd(), 'images', `${width}x${height}-${timestamp}.jpg`);
	yield fs_1.promises.writeFile(imagePath, imageBuffer);
	try {
		res.writeHead(200, {
			'Content-Type': 'image/jpg',
			'Content-Length': imageBuffer.length,
		});
		res.end(imageBuffer);
	} catch (error) {
		res.status(500).send('Error fetching the image');
	}
}));
app.get('/api/images', (req, res) => __awaiter(void 0, void 0, void 0, function * () {
	try {
		const imagesDir = path_1.default.join(process.cwd(), 'images');
		const files = yield fs_1.promises.readdir(imagesDir);
		res.json(files);
	} catch (error) {
		res.status(500).json({error: 'Failed to read images directory'});
	}
}));
const multer_1 = __importDefault(require('multer'));
const storage = multer_1.default.diskStorage({
	destination(req, file, cb) {
		cb(null, path_1.default.join(process.cwd(), 'images'));
	},
	filename(req, file, cb) {
		const name = file.originalname.split('.')[0] + `-${Date.now()}`;
		cb(null, name + '.jpg');
	},
});
const upload = (0, multer_1.default)({storage});
app.post('/api/upload', upload.single('photo'), (req, res, next) => {
	if (!req.file) {
		res.status(400).json({error: 'No file uploaded'});
		return;
	}

	res.json({filename: req.file.filename});
});
app.listen(port, () => {
	console.log(`Server is running on port ${port}`);
});
