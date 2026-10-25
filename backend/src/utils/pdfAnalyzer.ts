import fs from 'fs';

export interface AnalyzedDoc {
  pageCount: number;
  isColorDetected: boolean;
  fileSize: number;
  mimeType: string;
}

/**
 * Extracts page count and color characteristics from PDF or image documents
 */
export async function analyzeUploadedDocument(filePath: string, originalMime: string): Promise<AnalyzedDoc> {
  const stats = fs.statSync(filePath);
  const fileSize = stats.size;

  if (originalMime.includes('pdf')) {
    try {
      const buffer = fs.readFileSync(filePath);
      const text = buffer.toString('latin1');
      
      // Match /Count N in PDF catalog
      const countMatch = text.match(/\/Count\s+(\d+)/);
      let pageCount = countMatch ? parseInt(countMatch[1], 10) : 1;
      
      // Secondary check: count /Type /Page
      const pageMatches = text.match(/\/Type\s*\/Page\b/g);
      if (pageMatches && pageMatches.length > 0) {
        pageCount = Math.max(pageCount, pageMatches.length);
      }

      // Safe bounds
      if (isNaN(pageCount) || pageCount < 1) pageCount = 1;
      if (pageCount > 500) pageCount = 500;

      // Color detection heuristic: look for DeviceRGB or ICCBased RGB in PDF streams
      const isColor = /\/DeviceRGB|\/ColorSpace\s*\[\s*\/CalRGB/i.test(text);

      return {
        pageCount,
        isColorDetected: isColor,
        fileSize,
        mimeType: originalMime
      };
    } catch (e) {
      return {
        pageCount: 1,
        isColorDetected: false,
        fileSize,
        mimeType: originalMime
      };
    }
  }

  // Image or other document
  return {
    pageCount: 1,
    isColorDetected: true,
    fileSize,
    mimeType: originalMime
  };
}
