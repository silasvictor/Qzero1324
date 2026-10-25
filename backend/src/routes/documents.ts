import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { prisma } from '../config/prisma.js';
import { authenticateJWT, AuthenticatedRequest } from '../middleware/auth.js';
import { analyzeUploadedDocument } from '../utils/pdfAnalyzer.js';
import { calculatePrintPrice } from '../services/priceEngine.js';

const router = Router();

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.doc', '.png', '.jpg', '.jpeg'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOCX, and image files are supported'));
    }
  }
});

// Upload Document Endpoint
router.post('/upload', authenticateJWT, upload.single('file'), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, error: 'No file uploaded' });
      return;
    }

    const userId = req.user!.userId;
    const { filename, originalname, size, mimetype, path: filePath } = req.file;

    // Analyze document (pages, colors)
    const analysis = await analyzeUploadedDocument(filePath, mimetype);

    // Initial default print settings calculation
    const initialPrice = calculatePrintPrice({
      pageCount: analysis.pageCount,
      colorMode: 'BW',
      duplexMode: 'DOUBLE',
      paperSize: 'A4',
      copies: 1,
      printMode: 'SCHEDULED'
    });

    const document = await prisma.document.create({
      data: {
        userId,
        fileName: filename,
        originalName: originalname,
        fileSize: size,
        fileType: mimetype,
        pageCount: analysis.pageCount,
        isColorDetected: analysis.isColorDetected,
        fileUrl: `/uploads/${filename}`,
        printSettings: {
          create: {
            colorMode: analysis.isColorDetected ? 'COLOR' : 'BW',
            duplexMode: 'DOUBLE',
            paperSize: 'A4',
            orientation: 'PORTRAIT',
            pageRange: 'ALL',
            oddEven: 'ALL',
            copies: 1,
            includeTrackingMargin: true,
            bindingOption: 'NONE',
            calculatedPrice: initialPrice.totalAmount
          }
        }
      },
      include: {
        printSettings: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Document uploaded and analyzed successfully',
      document: {
        id: document.id,
        fileName: document.fileName,
        originalName: document.originalName,
        fileSize: document.fileSize,
        fileType: document.fileType,
        pageCount: document.pageCount,
        isColorDetected: document.isColorDetected,
        fileUrl: document.fileUrl,
        printSettings: document.printSettings,
        pricing: initialPrice
      }
    });
  } catch (err: any) {
    console.error('Upload error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get User's Documents
router.get('/', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const documents = await prisma.document.findMany({
      where: { userId: req.user!.userId },
      include: { printSettings: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ success: true, documents });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get Single Document
router.get('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { printSettings: true }
    });

    if (!document || document.userId !== req.user!.userId) {
      res.status(404).json({ success: false, error: 'Document not found' });
      return;
    }

    res.json({ success: true, document });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update Print Settings for Document
router.put('/:id/settings', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const document = await prisma.document.findUnique({
      where: { id: req.params.id },
      include: { printSettings: true }
    });

    if (!document || document.userId !== req.user!.userId) {
      res.status(404).json({ success: false, error: 'Document not found' });
      return;
    }

    const {
      colorMode = 'BW',
      duplexMode = 'DOUBLE',
      paperSize = 'A4',
      orientation = 'PORTRAIT',
      pageRange = 'ALL',
      oddEven = 'ALL',
      copies = 1,
      includeTrackingMargin = true,
      bindingOption = 'NONE',
      printMode = 'SCHEDULED'
    } = req.body;

    // Calculate effective pages from pageRange
    let effectivePages = document.pageCount;
    if (pageRange && pageRange !== 'ALL') {
      try {
        const parts = pageRange.split(',').flatMap((p: string) => {
          if (p.includes('-')) {
            const [s, e] = p.split('-').map(Number);
            return Array.from({ length: Math.max(0, e - s + 1) }, (_, i) => s + i);
          }
          return [Number(p)];
        });
        effectivePages = Math.max(1, Math.min(parts.length, document.pageCount));
      } catch (e) {
        effectivePages = document.pageCount;
      }
    }

    if (oddEven === 'ODD' || oddEven === 'EVEN') {
      effectivePages = Math.ceil(effectivePages / 2);
    }

    const pricing = calculatePrintPrice({
      pageCount: effectivePages,
      colorMode,
      duplexMode,
      paperSize,
      copies: Number(copies) || 1,
      printMode,
      bindingOption
    });

    const updatedSettings = await prisma.printSetting.upsert({
      where: { documentId: document.id },
      update: {
        colorMode,
        duplexMode,
        paperSize,
        orientation,
        pageRange,
        oddEven,
        copies: Number(copies) || 1,
        includeTrackingMargin,
        bindingOption,
        calculatedPrice: pricing.totalAmount
      },
      create: {
        documentId: document.id,
        colorMode,
        duplexMode,
        paperSize,
        orientation,
        pageRange,
        oddEven,
        copies: Number(copies) || 1,
        includeTrackingMargin,
        bindingOption,
        calculatedPrice: pricing.totalAmount
      }
    });

    res.json({
      success: true,
      settings: updatedSettings,
      pricing
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete Document
router.delete('/:id', authenticateJWT, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const doc = await prisma.document.findUnique({
      where: { id: req.params.id }
    });

    if (!doc || doc.userId !== req.user!.userId) {
      res.status(404).json({ success: false, error: 'Document not found' });
      return;
    }

    // Attempt to delete physical file
    const physicalPath = path.join(uploadDir, doc.fileName);
    if (fs.existsSync(physicalPath)) {
      try { fs.unlinkSync(physicalPath); } catch (e) { /* ignore */ }
    }

    await prisma.document.delete({ where: { id: doc.id } });

    res.json({ success: true, message: 'Document deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
