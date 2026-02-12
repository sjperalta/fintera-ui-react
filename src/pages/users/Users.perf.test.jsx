import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import Users from './index';
import AuthContext from '../../contexts/AuthContext';
import * as LocaleContextModule from '../../contexts/LocaleContext';

// Mock GenericList
const MockGenericList = vi.fn();

vi.mock('../../component/ui/GenericList', () => ({
  default: (props) => {
    MockGenericList(props);
    return (
      <div>
        <button onClick={() => props.onItemSelect({ id: 1, identity: '1', full_name: 'Test User' })}>
          Select User
        </button>
      </div>
    );
  }
}));

// Mock RightSidebar
vi.mock('../../component/user/RightSidebar', () => ({
  default: () => <div>RightSidebar</div>
}));

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ search: '', state: {} }),
  useNavigate: () => vi.fn(),
  Link: ({ children }) => <a>{children}</a>,
}));

// Mock getToken
vi.mock('../../../auth', () => ({
  getToken: () => 'mock-token'
}));

// Mock SearchFilterBar
vi.mock('../../component/ui/SearchFilterBar', () => ({
  default: () => <div>SearchFilterBar</div>
}));


describe('Users Component Performance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup Contexts
    const mockLocale = { t: (k) => k };
    vi.spyOn(LocaleContextModule, 'useLocale').mockReturnValue(mockLocale);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('passes stable renderItem to GenericList on re-renders', () => {
    const mockUser = { role: 'admin' };

    render(
      <AuthContext.Provider value={{ user: mockUser }}>
        <Users />
      </AuthContext.Provider>
    );

    // Initial render
    expect(MockGenericList).toHaveBeenCalled();
    const firstRenderProps = MockGenericList.mock.calls[0][0];
    const firstRenderItem = firstRenderProps.renderItem;

    // Trigger re-render by changing state (simulate selecting a user)
    const button = screen.getByText('Select User');
    fireEvent.click(button);

    // GenericList should re-render because Users re-renders
    // Wait, since we clicked, state updated, re-render happened.
    expect(MockGenericList).toHaveBeenCalledTimes(2);

    const secondRenderProps = MockGenericList.mock.calls[1][0];
    const secondRenderItem = secondRenderProps.renderItem;

    // Check if reference is stable
    // This expectation is expected to FAIL initially if renderUserItem is recreated
    expect(secondRenderItem).toBe(firstRenderItem);
  });
});
