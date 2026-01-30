import React from 'react';
import TimelinePaymentCard from './TimelinePaymentCard';
import { useLocale } from '../../../../contexts/LocaleContext';

function PaymentTimeline({ payments, onPaymentSuccess }) {
    const { t } = useLocale();
    const [showAllUpcoming, setShowAllUpcoming] = React.useState(false);
    const [showAllPaid, setShowAllPaid] = React.useState(false);

    const sortedPayments = [...payments].sort((a, b) => new Date(a.due_date) - new Date(b.due_date));

    // Group by status/time
    const overdue = sortedPayments.filter(p => new Date(p.due_date) < new Date() && p.status !== 'paid');
    const upcoming = sortedPayments.filter(p => new Date(p.due_date) >= new Date() && p.status !== 'paid');
    const paid = sortedPayments.filter(p => p.status === 'paid');

    const displayedUpcoming = showAllUpcoming ? upcoming : upcoming.slice(0, 3);
    const displayedPaid = showAllPaid ? paid : paid.slice(0, 3);

    const emptyState = (
        <div className="text-center py-10 text-bgray-500">
            <p>{t('payments.noPayments')}</p>
        </div>
    );

    return (
        <div className="space-y-12">
            {overdue.length > 0 && (
                <section>
                    <h3 className="text-rose-500 font-bold mb-6 flex items-center gap-3 text-lg">
                        <span className="w-3 h-3 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></span>
                        {t('payments.overdue')}
                    </h3>
                    <div className="ml-1 space-y-4">
                        {overdue.map(p => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} />
                        ))}
                    </div>
                </section>
            )}

            {upcoming.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-bgray-900 dark:text-white font-bold flex items-center gap-3 text-lg">
                            <span className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span>
                            {t('payments.upcoming')}
                        </h3>
                        {upcoming.length > 3 && (
                            <button
                                onClick={() => setShowAllUpcoming(!showAllUpcoming)}
                                className="text-sm font-medium text-success-300 hover:text-success-400 transition-colors"
                            >
                                {showAllUpcoming ? t('payments.showLess') : `${t('common.viewMore')} (${upcoming.length - 3})`}
                            </button>
                        )}
                    </div>
                    <div className="ml-1 space-y-4">
                        {displayedUpcoming.map(p => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} />
                        ))}
                    </div>
                </section>
            )}

            {paid.length > 0 && (
                <section>
                    <div className="flex justify-between items-center mb-6 opacity-80">
                        <h3 className="text-bgray-900 dark:text-white font-bold flex items-center gap-3 text-lg">
                            <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span>
                            {t('payments.completed')}
                        </h3>
                        {paid.length > 3 && (
                            <button
                                onClick={() => setShowAllPaid(!showAllPaid)}
                                className="text-sm font-medium text-bgray-500 hover:text-bgray-700 dark:hover:text-bgray-300 transition-colors"
                            >
                                {showAllPaid ? t('payments.showLess') : `${t('common.viewMore')} (${paid.length - 3})`}
                            </button>
                        )}
                    </div>
                    <div className={`ml-1 space-y-4 ${!showAllPaid ? 'opacity-70' : ''} transition-opacity`}>
                        {displayedPaid.map(p => (
                            <TimelinePaymentCard key={p.id} payment={p} onPaymentSuccess={onPaymentSuccess} />
                        ))}
                    </div>
                </section>
            )}

            {payments.length === 0 && emptyState}
        </div>
    );
}

export default PaymentTimeline;
