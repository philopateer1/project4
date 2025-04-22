import sharp from 'sharp';
import path from 'path';

export async function resizeImage(inputPath: string, outputPath: string, width: number, height: number): Promise<void> {
  try {
    await sharp(inputPath)
      .resize(width, height)
      .jpeg()
      .toFile(outputPath);
  } catch (error) {
    throw new Error(`Failed to resize image: ${error}`);
  }
}
