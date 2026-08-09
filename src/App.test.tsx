import { render } from '@testing-library/react';
import React from 'react';
import { expect, test, vi, beforeAll } from 'vitest';
import App from './App';

// Mock indexedDB for Firebase
beforeAll(() => {
  Object.defineProperty(window, 'indexedDB', {
    value: {
      open: vi.fn().mockReturnValue({
        onupgradeneeded: null,
        onsuccess: null,
        onerror: null,
      }),
    },
    writable: true,
  });

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(), 
      removeListener: vi.fn(), 
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn().mockReturnValue(false),
    })),
  });
});

// Mock AuthContext to avoid Firebase network calls and router conflicts
vi.mock('@/src/components/auth/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    profile: null,
    loading: false,
    login: vi.fn(),
    logout: vi.fn(),
    googleAccessToken: null,
    connectGoogle: vi.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

test('renders app without crashing', () => {
  render(<App />);
  expect(document.body).toBeInTheDocument();
});
