/**
 * Data Transfer Objects (DTOs) for Auth module
 * Separates domain models from API contracts
 */

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  role: 'PATIENT' | 'DOCTOR';
  specialization?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export class AuthResponseDto {
  id: string;
  name: string;
  email: string;
  role: string;
  specialization?: string | null;

  constructor(id: string, name: string, email: string, role: string, specialization?: string | null) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.role = role;
    this.specialization = specialization;
  }
}

export class TokenResponseDto {
  token: string;
  expiresIn: number;

  constructor(token: string, expiresIn: number = 3600) {
    this.token = token;
    this.expiresIn = expiresIn;
  }
}
  