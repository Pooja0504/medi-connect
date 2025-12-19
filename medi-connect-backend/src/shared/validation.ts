/**
 * Input validation utilities for sanitizing and validating user inputs
 */

export class ValidationError extends Error {
  constructor(public field: string, message: string, public code: string = 'VALIDATION_ERROR') {
    super(message);
    this.name = 'ValidationError';
  }
}

export const validators = {
  email: (value: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value) && value.length <= 255;
  },

  password: (value: string): boolean => {
    return value.length >= 8 && value.length <= 128;
  },

  name: (value: string): boolean => {
    return value.trim().length >= 2 && value.trim().length <= 255 && !/[<>{}]/g.test(value);
  },

  specialization: (value: string | undefined): boolean => {
    if (!value) return true; // Optional
    return value.trim().length >= 2 && value.trim().length <= 100 && !/[<>{}]/g.test(value);
  },

  appointmentDate: (value: string): boolean => {
    const date = new Date(value);
    return date instanceof Date && !isNaN(date.getTime()) && date > new Date();
  },

  clinicalNote: (value: string): boolean => {
    return value.trim().length >= 10 && value.trim().length <= 10000 && !/[<script>]/gi.test(value);
  },

  id: (value: string): boolean => {
    return value.length > 0 && value.length <= 255 && /^[a-zA-Z0-9_-]+$/.test(value);
  },
};

export const validateEmail = (value: string): boolean => validators.email(value);
export const validatePassword = (value: string): boolean => validators.password(value);
export const validateName = (value: string): boolean => validators.name(value);
export const validateSpecialization = (value: string | undefined): boolean => validators.specialization(value);
export const validateAppointmentDate = (value: string): boolean => validators.appointmentDate(value);
export const validateClinicalNote = (value: string): boolean => validators.clinicalNote(value);
export const validateId = (value: string): boolean => validators.id(value);

export const sanitize = {
  string: (value: string): string => {
    return value.trim().replace(/[<>{}]/g, '');
  },

  email: (value: string): string => {
    return value.trim().toLowerCase();
  },

  html: (value: string): string => {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  },
};
