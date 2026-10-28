import express from 'express';
import { register, login, logout, getMe, updateProfile } from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/authMiddleware.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/me', isAuthenticated, getMe);
router.patch('/profile', isAuthenticated, updateProfile);

export default router;
