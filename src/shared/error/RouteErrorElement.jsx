import React, { lazy, Suspense } from 'react'
import { useRouteError, isRouteErrorResponse } from 'react-router-dom'
import { useRollbar } from '@rollbar/react'
import { useLocale } from '@/contexts/LocaleContext'

const NotFound = lazy(() => import('./NotFound'))

export default function RouteErrorElement() {
  const { t } = useLocale()
  const error = useRouteError()
  const rollbar = useRollbar()

  React.useEffect(() => {
    try {
      if (rollbar) {
        rollbar.error(error)
      }
    } catch {
      // ignore
    }
  }, [error, rollbar])

  if (isRouteErrorResponse(error) && error.status === 404) {
    return (
      <Suspense fallback={<div className="flex items-center justify-center w-full min-h-[50vh]"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>}>
        <NotFound />
      </Suspense>
    )
  }

  if (isRouteErrorResponse(error)) {
    return (
      <div className="p-8">
        <h1 className="text-2xl font-bold">{error.status} {error.statusText}</h1>
        <p className="mt-4">{error.data?.message ?? t('errors.pageNotFound')}</p>
        <button onClick={() => window.location.reload()} className="mt-4 px-3 py-2 bg-blue-600 text-white rounded">{t('common.reload')}</button>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">{t('errors.unexpectedError')}</h1>
      <p className="mt-4">{String(error)}</p>
      <button onClick={() => window.location.reload()} className="mt-4 px-3 py-2 bg-blue-600 text-white rounded">{t('common.reload')}</button>
    </div>
  )
}
