import { Router } from 'express';
import { AuthService } from './auth.service';
import { validateEmail, validatePassword } from '../../shared/validation';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, specialization } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        code: 'MISSING_FIELD',
        message: 'name, email, password, and role are required',
      });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Invalid email format',
      });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        code: 'VALIDATION_ERROR',
        message: 'Password must be at least 8 characters long',
      });
    }

    const user = await AuthService.register({ name, email, password, role, specialization });

    res.status(201).json(user);
  } catch (err: any) {
    if (err.message === 'User already exists') {
      return res.status(409).json({
        code: 'ALREADY_EXISTS',
        message: err.message,
      });
    }
    res.status(400).json({ 
      code: 'VALIDATION_ERROR',
      error: err.message 
    });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        code: 'MISSING_FIELD',
        message: 'email and password are required',
      });
    }

    const token = await AuthService.login({ email, password });
    res.json({ token, expiresIn: '1h' });
  } catch (err: any) {
    res.status(401).json({
      code: 'INVALID_CREDENTIALS',
      message: 'Invalid email or password',
    });
  }
});

export default router;
