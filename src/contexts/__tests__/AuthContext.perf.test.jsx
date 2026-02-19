import React, { useState, useContext, memo } from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthContext, { AuthProvider } from '../AuthContext';

// Mock dependencies
vi.mock('../../features/auth/api', () => ({
  authApi: {
    refresh: vi.fn().mockResolvedValue({}),
    login: vi.fn()
  }
}));

// A component that consumes the context
const Consumer = memo(({ onRender }) => {
  const { loading } = useContext(AuthContext);
  onRender();
  if (loading) return <div>Loading...</div>;
  return <div>Loaded</div>;
});
Consumer.displayName = 'Consumer';

describe('AuthContext Performance', () => {
  it('should not re-render consumers when parent re-renders if context value is unchanged', async () => {
    const renderCount = vi.fn();

    const TestRoot = () => {
       const [_count, setCount] = useState(0);
       return (
         <>
            <button onClick={() => setCount(c => c + 1)} data-testid="update-btn">Update</button>
            <AuthProvider>
                <Consumer onRender={renderCount} />
            </AuthProvider>
         </>
       );
    };

    const { getByTestId, findByText } = render(<TestRoot />);

    // Wait for initial loading to complete
    await findByText('Loaded');

    // Reset the render count so we only measure the effect of parent re-render
    renderCount.mockClear();

    // Trigger update in parent
    await act(async () => {
      getByTestId('update-btn').click();
    });

    // Without memoization, AuthProvider re-renders -> new value object -> Consumer re-renders.
    // With memoization, AuthProvider re-renders -> same value object -> Consumer does NOT re-render.

    // We expect 0 re-renders with the optimization.
    expect(renderCount).toHaveBeenCalledTimes(0);
  });
});
