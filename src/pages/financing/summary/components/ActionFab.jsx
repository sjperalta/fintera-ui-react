import React from 'react';
import { useLocale } from '../../../../contexts/LocaleContext';

function ActionFab({ onClick }) {
    const { t } = useLocale();

    return (
        <button
            onClick={onClick}
            className="fixed bottom-6 right-6 md:hidden z-40 bg-success-300 text-white rounded-full p-4 shadow-lg hover:bg-success-400 focus:outline-none focus:ring-4 focus:ring-success-200 transition-all active:scale-95"
            aria-label={t('payments.makePayment')}
        >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
        </button>
    );
}

export default ActionFab;
