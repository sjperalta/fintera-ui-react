import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, afterEach, vi } from 'vitest'
vi.stubEnv('NODE_ENV', 'development')

// Mock Sentry module (define mocks inside factory to avoid hoisting TDZ)
vi.mock('@sentry/react', () => {
  const captureException = vi.fn(() => 'event-123')
  const showReportDialog = vi.fn()
  return {
    captureException,
    showReportDialog,
  }
})

import * as Sentry from '@sentry/react'
// Mock LocaleContext with absolute path
vi.mock('src/contexts/LocaleContext', () => ({
  useLocale: () => ({
    locale: 'en',
    setLocale: () => {},
    t: (key) => {
      const translations = {
        'errors.reportFeedback': 'Report Feedback',
        'common.retry': 'Retry',
        'errors.somethingWentWrong': 'Something went wrong.',
      };
      return translations[key] || key;
    },
    getSupportedLocales: () => ['en', 'es'],
    getCurrentLocaleName: () => 'English',
  }),
  LocaleProvider: ({ children }) => children,
}));

import ErrorBoundary from '../ErrorBoundary.jsx'

function Thrower({ shouldThrow }) {
  if (shouldThrow) throw new Error('boom')
  return <div>Rendered OK</div>
}

describe('ErrorBoundary', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('captures exception and renders fallback, allows report and retry', async () => {
    const { rerender } = render(
      <ErrorBoundary fallback={<div>Fallback UI</div>}>
        <Thrower shouldThrow={true} />
      </ErrorBoundary>
    )

    // Fallback shown
    expect(screen.getByText('Fallback UI')).toBeTruthy()

  // Sentry.captureException called
  expect(Sentry.captureException).toHaveBeenCalled()

  // Report button should be shown (eventId returned)
  const reportBtn = screen.getByText('errors.reportFeedback')
  expect(reportBtn).toBeTruthy()

  // Click report and assert showReportDialog called with eventId
  fireEvent.click(reportBtn)
  expect(Sentry.showReportDialog).toHaveBeenCalledWith({ eventId: 'event-123' })

    // Now retry: re-render with a non-throwing child
    const retryBtn = screen.getByText('common.retry')
    fireEvent.click(retryBtn)

    rerender(
      <ErrorBoundary fallback={<div>Fallback UI</div>}>
        <Thrower shouldThrow={false} />
      </ErrorBoundary>
    )

    // After rerender, the child should render
    expect(screen.getByText('Rendered OK')).toBeTruthy()
  })
})
