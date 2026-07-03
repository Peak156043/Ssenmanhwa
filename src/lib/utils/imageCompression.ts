import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file (JPG, PNG) to WebP format for optimal storage and bandwidth.
 * 
 * @param file The original image file
 * @param options Compression options
 * @returns A compressed File object in WebP format
 */
export async function compressImageToWebP(
  file: File, 
  options?: { maxWidthOrHeight?: number; maxSizeMB?: number; quality?: number }
): Promise<File> {
  
  const compOptions = {
    maxSizeMB: options?.maxSizeMB ?? 0.5, // Target 500KB max by default
    maxWidthOrHeight: options?.maxWidthOrHeight,
    useWebWorker: true,
    fileType: 'image/webp' as string, // Force WebP output
    initialQuality: options?.quality ?? 0.85 // 85% quality by default
  };

  try {
    const compressedBlob = await imageCompression(file, compOptions);
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
