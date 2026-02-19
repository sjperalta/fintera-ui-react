import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import Projects from '../index';

expect.extend(matchers);
import { projectsApi } from '../../api';
import AuthContext from '@/contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

// Mock dependencies
vi.mock('../../api', () => ({
  projectsApi: {
    list: vi.fn(),
    import: vi.fn()
  }
}));

// Mock useLocale
vi.mock('@/contexts/LocaleContext', () => ({
  useLocale: () => ({ t: (key) => key })
}));

// Mock useToast
vi.mock('@/contexts/ToastContext', () => ({
  useToast: () => ({ showToast: vi.fn() })
}));

// We want to capture props passed to GenericFilter
const genericFilterProps = [];
vi.mock('@/shared/forms/GenericFilter', () => {
  return {
    default: (props) => {
      genericFilterProps.push(props);
      return <div data-testid="generic-filter">Generic Filter</div>;
    }
  };
});

// Mock contexts
const mockAuthContext = {
  user: { role: 'admin' },
  token: 'mock-token',
  loading: false
};

const renderProjects = () => {
  return render(
    <AuthContext.Provider value={mockAuthContext}>
      <BrowserRouter>
        <Projects />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('Projects Component Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    genericFilterProps.length = 0;
  });

  it('handleSearchChange and handleSortChange references should be stable across re-renders', async () => {
    // Mock initial fetch
    projectsApi.list.mockResolvedValue({
      projects: [],
      pagination: { pages: 1 }
    });

    renderProjects();

    // Wait for the effect to run and data to "load" (state update triggers re-render)
    await waitFor(() => expect(projectsApi.list).toHaveBeenCalled());

    // Wait for loading to finish
    await waitFor(() => expect(screen.queryByText('projectsPage.loadingProjects')).not.toBeInTheDocument());

    expect(genericFilterProps.length).toBeGreaterThanOrEqual(2);

    const firstRenderProps = genericFilterProps[0];
    const lastRenderProps = genericFilterProps[genericFilterProps.length - 1];

    expect(firstRenderProps.onSearchChange).toBe(lastRenderProps.onSearchChange);
    expect(firstRenderProps.onFilterChange).toBe(lastRenderProps.onFilterChange);
  });
});
