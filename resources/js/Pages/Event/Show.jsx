import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

// ── Inventory Badge ────────────────────────────────────────────────
function InventoryBadge({ inventory }) {
    if (inventory <= 0) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Sold Out
            </span>
        );
    }

    if (inventory < 5000) {
        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-3 py-1 text-sm font-semibold text-orange-700 dark:bg-orange-900/40 dark:text-orange-300">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                Filling Fast!
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Available
        </span>
    );
}

// ── Loading Spinner ────────────────────────────────────────────────
function Spinner() {
    return (
        <svg
            className="h-5 w-5 animate-spin text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
        >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
    );
}

// ── Flash Toast ────────────────────────────────────────────────────
function FlashToast({ type, message, onClose }) {
    const styles = {
        success: 'border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300',
        error: 'border-red-400 bg-red-50 text-red-800 dark:border-red-600 dark:bg-red-900/30 dark:text-red-300',
    };

    useEffect(() => {
        const timer = setTimeout(onClose, 5000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 rounded-xl border px-5 py-4 shadow-2xl backdrop-blur-sm transition-all duration-300 animate-slide-in ${styles[type]}`}>
            <span className="text-lg">{type === 'success' ? '✅' : '❌'}</span>
            <p className="text-sm font-medium max-w-xs">{message}</p>
            <button onClick={onClose} className="ml-2 opacity-50 hover:opacity-100 transition-opacity">✕</button>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────
export default function Show({ event, redis_inventory }) {
    const { flash } = usePage().props;
    const [showFlash, setShowFlash] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        event_id: event.id,
        quantity: 1,
    });

    // Show flash messages when they arrive
    useEffect(() => {
        if (flash?.success) setShowFlash({ type: 'success', message: flash.success });
        if (flash?.error) setShowFlash({ type: 'error', message: flash.error });
    }, [flash?.success, flash?.error]);

    const isSoldOut = redis_inventory <= 0;

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('bookings.store'), {
            preserveScroll: true,
            onSuccess: () => reset('quantity'),
        });
    };

    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(event.price);

    const formattedInventory = new Intl.NumberFormat('en-IN').format(redis_inventory);
    const formattedTotal = new Intl.NumberFormat('en-IN').format(event.total_tickets);

    const percentLeft = Math.round((redis_inventory / event.total_tickets) * 100);

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Event Details
                </h2>
            }
        >
            <Head title={event.name} />

            {/* Flash Toast */}
            {showFlash && (
                <FlashToast
                    type={showFlash.type}
                    message={showFlash.message}
                    onClose={() => setShowFlash(null)}
                />
            )}

            <div className="py-12">
                <div className="mx-auto max-w-3xl sm:px-6 lg:px-8">

                    {/* ── Main Card ─────────────────────────────────── */}
                    <div className="overflow-hidden rounded-2xl bg-white shadow-xl dark:bg-gray-800 border border-gray-200 dark:border-gray-700">

                        {/* Hero Banner */}
                        <div className="relative bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 px-8 py-12">
                            {/* Decorative pattern */}
                            <div className="absolute inset-0 opacity-10">
                                <div className="absolute top-4 left-4 h-32 w-32 rounded-full bg-white" />
                                <div className="absolute bottom-4 right-8 h-24 w-24 rounded-full bg-white" />
                                <div className="absolute top-1/2 left-1/2 h-16 w-16 rounded-full bg-white" />
                            </div>

                            <div className="relative">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-medium uppercase tracking-widest text-purple-200">
                                            Live Event
                                        </p>
                                        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">
                                            {event.name}
                                        </h1>
                                    </div>
                                    <InventoryBadge inventory={redis_inventory} />
                                </div>

                                <div className="mt-6 flex flex-wrap items-center gap-6 text-purple-100">
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                        </svg>
                                        <span className="font-semibold text-white text-lg">{formattedPrice}</span>
                                        <span className="text-sm">per ticket</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="text-sm">{formattedTotal} total capacity</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ── Inventory Progress ──────────────────── */}
                        <div className="border-b border-gray-200 bg-gray-50 px-8 py-5 dark:border-gray-700 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between text-sm">
                                <span className="font-medium text-gray-600 dark:text-gray-400">
                                    Tickets Remaining
                                </span>
                                <span className="font-bold text-gray-900 dark:text-white">
                                    {formattedInventory} / {formattedTotal}
                                </span>
                            </div>
                            <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 ease-out ${percentLeft > 50
                                            ? 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                                            : percentLeft > 10
                                                ? 'bg-gradient-to-r from-orange-400 to-orange-500'
                                                : 'bg-gradient-to-r from-red-400 to-red-500'
                                        }`}
                                    style={{ width: `${Math.max(percentLeft, 1)}%` }}
                                />
                            </div>
                            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-500">
                                {percentLeft}% remaining
                            </p>
                        </div>

                        {/* ── Booking Form ─────────────────────────── */}
                        <div className="px-8 py-8">
                            <form onSubmit={handleSubmit}>
                                <div className="flex flex-col gap-6 sm:flex-row sm:items-end">
                                    {/* Quantity Selector */}
                                    <div className="flex-1">
                                        <label
                                            htmlFor="quantity"
                                            className="block text-sm font-semibold text-gray-700 dark:text-gray-300"
                                        >
                                            Number of Tickets
                                        </label>
                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                                            Maximum 4 tickets per person per event
                                        </p>
                                        <select
                                            id="quantity"
                                            value={data.quantity}
                                            onChange={(e) => setData('quantity', parseInt(e.target.value))}
                                            disabled={isSoldOut || processing}
                                            className="mt-2 block w-full rounded-xl border-gray-300 bg-white py-3 pl-4 pr-10 text-base shadow-sm transition focus:border-purple-500 focus:ring-purple-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 sm:text-sm"
                                        >
                                            {[1, 2, 3, 4].map((n) => (
                                                <option key={n} value={n}>
                                                    {n} {n === 1 ? 'Ticket' : 'Tickets'} — {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(event.price * n)}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.quantity && (
                                            <p className="mt-2 flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                                                <svg className="h-4 w-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {errors.quantity}
                                            </p>
                                        )}
                                        {errors.event_id && (
                                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                                                {errors.event_id}
                                            </p>
                                        )}
                                    </div>

                                    {/* Submit Button */}
                                    <div className="sm:flex-shrink-0">
                                        <button
                                            type="submit"
                                            disabled={isSoldOut || processing}
                                            className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all duration-200 hover:from-violet-500 hover:to-indigo-500 hover:shadow-xl hover:shadow-violet-500/30 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-lg dark:focus:ring-offset-gray-800 sm:w-auto"
                                        >
                                            <span className="flex items-center justify-center gap-2">
                                                {processing ? (
                                                    <>
                                                        <Spinner />
                                                        Processing…
                                                    </>
                                                ) : isSoldOut ? (
                                                    'Sold Out'
                                                ) : (
                                                    <>
                                                        <svg className="h-5 w-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                                        </svg>
                                                        Book Tickets
                                                    </>
                                                )}
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* ── Info Footer ──────────────────────────── */}
                        <div className="border-t border-gray-200 bg-gray-50 px-8 py-4 dark:border-gray-700 dark:bg-gray-800/50">
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Bookings are confirmed instantly. Tickets are non-refundable.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Inline animation keyframes ──────────────────────── */}
            <style>{`
                @keyframes slide-in {
                    from { opacity: 0; transform: translateX(1rem); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-slide-in {
                    animation: slide-in 0.3s ease-out;
                }
            `}</style>
        </AuthenticatedLayout>
    );
}
