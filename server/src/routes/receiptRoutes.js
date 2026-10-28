import express from 'express';
import { renderReceipt } from '../controllers/receiptController.js';

const router = express.Router();

// Server-side rendered EJS receipt route
router.get('/:bookingReference', renderReceipt);

export default router;
