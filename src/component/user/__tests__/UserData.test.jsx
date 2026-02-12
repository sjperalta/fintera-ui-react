import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import UserData from '../UserData';
import * as matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

// Mock the hooks
vi.mock('../../../contexts/LocaleContext', () => ({
  useLocale: () => ({
    t: (key) => key,
  }),
}));

vi.mock('../../../contexts/ToastContext', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('UserData Component', () => {
  const userInfo = {
    id: 1,
    full_name: 'Test User',
    phone: '123-456-7890',
    email: 'test@example.com',
    status: 'active',
    role: 'user',
    created_at: '2023-01-01T00:00:00Z',
    profile_picture_thumb: '/path/to/image.jpg',
    creator: { full_name: 'Creator' }
  };

  it('renders profile image with loading="lazy" attribute', () => {
    render(
      <MemoryRouter>
        <UserData userInfo={userInfo} index={0} />
      </MemoryRouter>
    );

    const img = screen.getByAltText('Test User');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('loading', 'lazy');
  });
});
