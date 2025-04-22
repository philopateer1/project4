# Image Gallery Project

This project is a simple image gallery web application with the following features:

- Display a gallery of images fetched from a backend server.
- Upload new JPG images to the gallery.
- Resize images by setting custom width and height, with the dimensions saved persistently.
- Backend API to serve images, upload images, and save image metadata (width and height).
- Images and metadata are stored on the server filesystem.

## Project Structure

- `src/server.ts`: Express backend server handling image serving, uploading, resizing, and metadata management.
- `frontend/index.html`: Frontend HTML page for the gallery.
- `frontend/indexJS/index.js`: Frontend JavaScript handling image loading, resizing, and uploading.
- `imgFiles/images`: Directory where images are stored on the server.
## Prerequisites

- Node.js (version 14 or higher recommended)
- npm (Node package manager)

## Setup and Running

1. Install dependencies:

```bash
npm install
```

2. Start the backend server:

```bash
npm run start
```

The server will run on `http://localhost:3000`.

3. Open the frontend:

Open `frontend/index.html` in a web browser.

## Features

### Viewing Images

- The gallery loads images from the backend API.
- Images are displayed with their saved width and height if available.

### Uploading Images

- Use the upload form to select and upload JPG images.
- After upload, the gallery reloads to show the new image.

### Resizing Images

- Click on an image to enter new width and height in pixels.
- The new dimensions are applied immediately and saved to the backend.
- The saved dimensions persist on page reload.

## API Endpoints

- `GET /api/images`: Returns a list of images with their metadata.
- `POST /api/upload`: Uploads a new image file.
- `POST /api/images/resize`: Saves new width and height for an image.
- `GET /images/:filename`: Serves image files statically.

## Notes

- Only JPG images are supported for upload.
- Image metadata is stored in a JSON file on the server.
- Images are stored in the `imgFiles/images` directory.

## License

This project is provided as-is without any warranty.
