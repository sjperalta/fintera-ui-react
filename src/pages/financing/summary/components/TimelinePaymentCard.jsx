import React, { useState, useContext } from 'react';
import { createPortal } from 'react-dom';
import { format, isBefore, parseISO, startOfDay } from "date-fns";
import { es, enUS } from 'date-fns/locale';
import { useLocale } from '../../../../contexts/LocaleContext';
import { useToast } from '../../../../contexts/ToastContext';
import AuthContext from '../../../../contexts/AuthContext';
import { API_URL } from '../../../../../config';

function TimelinePaymentCard({ payment, onPaymentSuccess }) {
    const { t, locale } = useLocale();
    const { showToast } = useToast();
    const { token } = useContext(AuthContext);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const { id, amount, due_date, status, interest_amount, contract } = payment;
    const dueDate = parseISO(due_date);
    const isOverdue = isBefore(dueDate, startOfDay(new Date())) && status !== 'paid';
    const currency = contract?.currency || 'HNL';
    const dateLocale = locale === 'es' ? es : enUS;

    const interest = Number(interest_amount || 0);
    const totalDue = Number(amount || 0) + interest;

    const formatCurrency = (val) => new Intl.NumberFormat(locale === 'es' ? 'es-HN' : 'en-US', {
        style: 'currency',
        currency: currency
    }).format(val);

    const handleUpload = async () => {
        if (!selectedFile) return;
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('receipt', selectedFile);
            formData.append('paid_amount', totalDue.toString());

            const res = await fetch(`${API_URL}/api/v1/payments/${id}/upload_receipt`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            showToast(t('payments.paymentSuccessful'), "success");
            setIsModalOpen(false);
            onPaymentSuccess?.();
            setSelectedFile(null);
        } catch (err) {
            showToast(t('payments.paymentError'), "error");
        } finally {
            setIsUploading(false);
        }
    };

    const getStatusColor = () => {
        if (status === 'paid') return 'bg-emerald-500';
        if (isOverdue) return 'bg-rose-500';
        return 'bg-amber-500';
    };

    return (
        <div className="relative pl-8 pb-4 group last:pb-0">
            {/* Vertical timeline line */}
            <div className="absolute left-[3px] top-4 bottom-0 w-[2px] bg-bgray-200 dark:bg-bgray-800 group-last:hidden"></div>

            {/* Timeline dot */}
            <div className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-bgray-900 z-10 transition-transform group-hover:scale-125 ${getStatusColor()}`}></div>

            <div className="bg-white dark:bg-bgray-900/50 backdrop-blur-sm border border-bgray-200 dark:border-bgray-800 rounded-2xl p-5 transition-all duration-300 hover:shadow-xl hover:shadow-bgray-200/50 dark:hover:shadow-none hover:-translate-y-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-semibold text-bgray-500 uppercase tracking-widest">
                                {format(dueDate, 'dd MMM yyyy', { locale: dateLocale })}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' :
                                isOverdue ? 'bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400' :
                                    'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'
                                }`}>
                                {status === 'paid' ? t('payments.paid') : isOverdue ? t('payments.overdue') : t('payments.pending')}
                            </span>
                        </div>
                        <h4 className="text-xl font-black text-bgray-900 dark:text-white">
                            {formatCurrency(totalDue)}
                        </h4>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-bgray-500 dark:text-bgray-400">
                            <span>{t('payments.subtotal')}: {formatCurrency(amount)}</span>
                            {interest > 0 && (
                                <>
                                    <span className="w-1 h-1 rounded-full bg-bgray-300"></span>
                                    <span className="text-rose-500 font-medium">{t('payments.interest')}: {formatCurrency(interest)}</span>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-center">
                        {status !== 'paid' && status !== 'submitted' && (
                            <button
                                onClick={() => setIsModalOpen(true)}
                                className="px-5 py-2 bg-bgray-900 dark:bg-white text-white dark:text-bgray-900 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 shadow-lg shadow-bgray-900/20 dark:shadow-none"
                            >
                                {t('payments.uploadReceipt')}
                            </button>
                        )}
                        {status === 'paid' && (
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-500/5 px-4 py-2 rounded-xl text-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                                {t('payments.completed')}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Portal */}
            {isModalOpen && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-bgray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-bgray-900 w-full max-w-md rounded-3xl p-8 shadow-2xl border border-bgray-100 dark:border-bgray-800 animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-black text-bgray-900 dark:text-white">{t('payments.uploadReceipt')}</h3>
                                <p className="text-sm text-bgray-500 mt-1">{t('payments.detailedPaymentInfo')}</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-bgray-100 dark:hover:bg-bgray-800 rounded-full transition-colors">
                                <svg className="w-5 h-5 text-bgray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-bgray-50 dark:bg-bgray-800/50 border border-bgray-100 dark:border-bgray-700">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-bgray-500">{t('payments.amount')}</span>
                                    <span className="text-lg font-bold text-bgray-900 dark:text-white">{formatCurrency(totalDue)}</span>
                                </div>
                                <div className="text-[10px] text-bgray-400 uppercase tracking-wider">
                                    {format(dueDate, 'PPP', { locale: dateLocale })}
                                </div>
                            </div>

                            <div className="relative group">
                                <input
                                    type="file"
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
                                    className="hidden"
                                    id="receipt-upload"
                                />
                                <label
                                    htmlFor="receipt-upload"
                                    className={`flex flex-col items-center justify-center p-8 rounded-2xl border-2 border-dashed transition-all cursor-pointer ${selectedFile
                                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5'
                                        : 'border-bgray-200 dark:border-bgray-700 hover:border-bgray-400 dark:hover:border-bgray-500 bg-bgray-50/50 dark:bg-bgray-800/20'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${selectedFile ? 'bg-emerald-100 text-emerald-600' : 'bg-bgray-100 text-bgray-400 dark:bg-bgray-800'}`}>
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                                    </div>
                                    <span className="text-sm font-bold text-bgray-900 dark:text-white">
                                        {selectedFile ? selectedFile.name : t('payments.selectFileToUpload')}
                                    </span>
                                    <span className="text-xs text-bgray-500 mt-1">{t('payments.clickToBrowse')}</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="flex-1 py-4 px-6 rounded-2xl border border-bgray-200 dark:border-bgray-700 text-bgray-600 dark:text-bgray-300 font-bold hover:bg-bgray-50 dark:hover:bg-bgray-800 transition-colors"
                            >
                                {t('common.cancel')}
                            </button>
                            <button
                                onClick={handleUpload}
                                disabled={!selectedFile || isUploading}
                                className="flex-[2] py-4 px-6 rounded-2xl bg-bgray-900 dark:bg-white text-white dark:text-bgray-900 font-black disabled:opacity-50 disabled:scale-100 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-bgray-900/20 dark:shadow-none"
                            >
                                {isUploading ? t('common.processing') : t('payments.confirm')}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
}

export default TimelinePaymentCard;
