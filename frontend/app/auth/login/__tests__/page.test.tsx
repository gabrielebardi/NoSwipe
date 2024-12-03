import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from '../page';
import { apiService } from '../../../services/api';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock api service
jest.mock('../../../services/api', () => ({
  apiService: {
    login: jest.fn(),
  },
}));

describe('LoginPage', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders login form', () => {
    render(<LoginPage />);
    
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
  });

  it('handles successful login', async () => {
    const mockToken = 'mock-token';
    (apiService.login as jest.Mock).mockResolvedValueOnce(mockToken);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockRouter.push).toHaveBeenCalledWith('/');
    });
  });

  it('handles login failure', async () => {
    const mockError = new Error('Invalid credentials');
    (apiService.login as jest.Mock).mockRejectedValueOnce(mockError);

    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'test@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'wrongpassword' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Login failed. Please try again.')).toBeInTheDocument();
      expect(mockRouter.push).not.toHaveBeenCalled();
    });
  });

  it('validates required fields', async () => {
    render(<LoginPage />);
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
      expect(apiService.login).not.toHaveBeenCalled();
    });
  });

  it('validates email format', async () => {
    render(<LoginPage />);

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'invalid-email' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(screen.getByText('Invalid email format')).toBeInTheDocument();
      expect(apiService.login).not.toHaveBeenCalled();
    });
  });
});