import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file (JPG, PNG) to WebP format for optimal storage and bandwidth.
 * 
 * @param file The original image file
 * @param maxWidthOrHeight Maximum width or height of the output image (default 1200px)
 * @returns A compressed File object in WebP format
 */
export async function compressImageToWebP(file: File, maxWidthOrHeight: number = 1200): Promise<File> {
  // If the file is already small (e.g., less than 50KB) and is webp/avif, we can skip it, 
  // but it's usually safer to normalize everything.
  
  const options = {
    maxSizeMB: 0.5, // Target 500KB max, but usually WebP will drop it to 100-200KB anyway
    maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp' as string, // Force WebP output
    initialQuality: 0.85 // 85% quality is a sweet spot for Webtoon/Manhwa
  };

  try {
    const compressedBlob = await imageCompression(file, options);
    // Convert Blob back to File
    const originalNameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
    const newName = `${originalNameWithoutExt}.webp`;
    
    return new File([compressedBlob], newName, {
      type: 'image/webp',
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error('Error compressing image:', error);
    // Fallback to original file if compression fails for some reason
    return file;
  }
}
