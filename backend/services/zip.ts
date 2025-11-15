import AdmZip from 'adm-zip';

export interface ExtractedFile {
    filename: string;
    buffer: Buffer;
    mimetype: string;
}

/**
 * Extract images from a ZIP file
 * @param zipBuffer - Buffer containing the ZIP file
 * @returns Array of extracted image files
 */
export function extractImagesFromZip(zipBuffer: Buffer): ExtractedFile[] {
    const zip = new AdmZip(zipBuffer);
    const zipEntries = zip.getEntries();
    const extractedFiles: ExtractedFile[] = [];

    // Supported image extensions
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];

    for (const entry of zipEntries) {
        // Skip directories and hidden files
        if (entry.isDirectory || entry.name.startsWith('.') || entry.name.startsWith('__MACOSX')) {
            continue;
        }

        // Check if file is an image
        const fileName = entry.name.toLowerCase();
        const isImage = imageExtensions.some(ext => fileName.endsWith(ext));

        if (isImage) {
            try {
                const buffer = entry.getData();

                // Determine MIME type from extension
                let mimetype = 'image/jpeg';
                if (fileName.endsWith('.png')) mimetype = 'image/png';
                else if (fileName.endsWith('.gif')) mimetype = 'image/gif';
                else if (fileName.endsWith('.webp')) mimetype = 'image/webp';
                else if (fileName.endsWith('.bmp')) mimetype = 'image/bmp';

                // Extract just the filename (remove path)
                const filename = entry.name.split('/').pop() || entry.name;

                extractedFiles.push({
                    filename,
                    buffer,
                    mimetype,
                });
            } catch (error) {
                console.warn(`Could not extract ${entry.name}:`, error);
            }
        }
    }

    return extractedFiles;
}