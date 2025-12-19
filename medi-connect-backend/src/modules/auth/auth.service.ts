import { prisma } from '../../config/prisma';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey';
dotenv.config();

export class AuthService {
    static async register({
        name,
        email,
        password,
        role,
        specialization
    }: {
        name: string;
        email: string;
        password: string;
        role: 'PATIENT' | 'DOCTOR';
        specialization?: string;
    }) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) throw new Error('User already exists');

        const hashedPassword = await bcrypt.hash(password, 10);
        if (role === 'DOCTOR' && !specialization) {
            throw new Error('Doctors must have a specialization');
        }

        const user = await prisma.user.create({
            data: { name, email, password: hashedPassword, role, specialization },
        });

        return { id: user.id, name: user.name, email: user.email, role: user.role, specialization: user.specialization };
    }

    static async login({
        email,
        password,
    }: {
        email: string;
        password: string;
    }) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error('Invalid credentials');

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) throw new Error('Invalid credentials');

        const token = jwt.sign(
            { sub: user.id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        return token;
    }
}
