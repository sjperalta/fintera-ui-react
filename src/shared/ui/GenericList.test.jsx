import React, { useState } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import GenericList from './GenericList';

expect.extend(matchers);
import { apiClient } from '../../lib/apiClient';

// Mock apiClient
vi.mock('../../lib/apiClient', () => ({
  apiClient: {
    get: vi.fn(() => Promise.resolve({
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      total: 2,
    })),
  },
}));

// Mock useLocale
vi.mock('../../contexts/LocaleContext', () => ({
  useLocale: () => ({
    t: (key) => key,
  }),
}));

describe('GenericList Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    apiClient.get.mockResolvedValue({
      items: [
        { id: 1, name: 'Item 1' },
        { id: 2, name: 'Item 2' },
      ],
      total: 2,
    });
  });

  it('updates sort parameters when sortBy prop changes', async () => {
    // Wrapper component to control sortBy prop
    const TestComponent = () => {
      const [sortBy, setSortBy] = useState('created_at-desc');

      return (
        <div>
          <button onClick={() => setSortBy('name-asc')}>Change Sort</button>
          <GenericList
            endpoint="/test"
            renderItem={(item) => <tr key={item.id}><td>{item.name}</td></tr>}
            sortBy={sortBy}
            columns={[{ label: 'Name', sortKey: 'name' }]}
            refreshTrigger={0}
            entityName="items"
            showMobileCards={false}
          />
        </div>
      );
    };

    render(<TestComponent />);

    // Wait for initial load
    await waitFor(() => expect(screen.getByText('Item 1')).toBeInTheDocument());

    // Check initial sort param
    expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('sort=created_at-desc'),
        expect.any(Object)
    );

    const button = screen.getByText('Change Sort');
    await act(async () => {
      button.click();
    });

    // Wait for new fetch with updated sort param
    await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledWith(
            expect.stringContaining('sort=name-asc'),
            expect.any(Object)
        );
    });
  });
});
