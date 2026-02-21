import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';

// ── Inventory Badge
function InventoryBadge({ inventory }) {
    if (inventory <= 0) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-red-500/10 px-3 py-1 text-sm font-semibold text-red-600 dark:bg-red-500/20 dark:text-red-400">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                Sold Out
            </span>
        );
    }

    if (inventory < 5000) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-3 py-1 text-sm font-semibold text-orange-600 dark:bg-orange-500/20 dark:text-orange-400">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                Filling Fast!
            </span>
        );
    }

    return (
        <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Available
        </span>
    );
}

// ── Main UI Component
export default function Show({ event, redis_inventory, auth }) {
    const { flash } = usePage().props;
    const [toast, setToast] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        event_id: event.id,
        quantity: 1,
    });

    const isSoldOut = redis_inventory <= 0;

    useEffect(() => {
        if (flash?.success) setToast({ type: 'success', text: flash.success });
        if (flash?.error) setToast({ type: 'error', text: flash.error });
        if (flash) {
            const timer = setTimeout(() => setToast(null), 8000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('bookings.store'), {
            preserveScroll: true,
            onSuccess: () => reset('quantity'),
        });
    };

    const formattedPrice = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(event.price);
    const capacityLeft = Math.round((redis_inventory / event.total_tickets) * 100);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
            <Head title={event.name} />

            {/* ── Navbar ────────────────────────────────────────────── */}
            <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight">TicketFlow</span>
                    </Link>

                    <div className="flex gap-4 items-center">
                        <ThemeToggle />
                        {auth.user ? (
                            <>
                                <Link href={route('tickets.index')} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">My Tickets</Link>
                                <Link method="post" href={route('logout')} as="button" className="text-sm font-medium text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition cursor-pointer">Log out</Link>
                            </>
                        ) : (
                            <Link href={route('login')} className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition">Sign in</Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* ── Toasts ────────────────────────────────────────────── */}
            {toast && !processing && (
                <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-[slideDown_0.3s_ease-out]">
                    <div className={`flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-300' : 'bg-red-500/10 border-red-500/20 text-red-700 dark:text-red-300'
                        }`}>
                        <span className="text-xl">{toast.type === 'success' ? '🎉' : '⚠️'}</span>
                        <p className="font-medium text-sm">{toast.text}</p>
                        <button onClick={() => setToast(null)} className="ml-4 opacity-50 hover:opacity-100">✕</button>
                    </div>
                </div>
            )}

            {/* ── Processing Overlay (Payment Simulation) ───────────── */}
            {processing && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-md transition-all duration-500 animate-[fadeIn_0.5s_ease-out]">
                    <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm text-center mx-4 animate-[scaleUp_0.5s_ease-out]">
                        <div className="relative h-20 w-20">
                            {/* Spinning glow effect */}
                            <div className="absolute inset-0 rounded-full border-t-4 border-purple-500 border-opacity-30 animate-spin" />
                            <div className="absolute inset-2 rounded-full border-r-4 border-indigo-500 border-opacity-60 animate-[spin_1.5s_linear_infinite]" />
                            <div className="absolute inset-4 rounded-full border-b-4 border-violet-500 sm animate-[spin_2s_linear_infinite]" />
                            <svg className="absolute inset-0 h-full w-full text-purple-500 opacity-20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v2zm0-4H9V7h2v5zm4 4h-2v-2h2v2zm0-4h-2V7h2v5z" /></svg>
                        </div>
                        <h3 className="mt-6 text-xl font-bold text-gray-900 dark:text-white">Connecting to Gateway...</h3>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            Please wait while we simulate payment processing and acquire atomic locks. This will take ~30 seconds. Do not refresh.
                        </p>
                    </div>
                </div>
            )}

            {/* ── Main Content ──────────────────────────────────────── */}
            <main className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto flex flex-col gap-8">

                {/* Header Card */}
                <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl">
                    <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-purple-500 to-indigo-500" />

                    <div className="p-8 sm:p-12 sm:flex sm:items-start sm:justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <InventoryBadge inventory={redis_inventory} />
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Official Event</span>
                            </div>
                            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">{event.name}</h1>
                            <p className="mt-4 text-xl text-gray-500 dark:text-gray-400">
                                {formattedPrice} <span className="text-sm font-normal opacity-70">per ticket</span>
                            </p>
                        </div>

                        {/* Inventory visualizer */}
                        <div className="mt-8 sm:mt-0 max-w-[200px] w-full shrink-0">
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
                                <div className="flex justify-between text-xs font-semibold mb-2">
                                    <span className="text-gray-500">Remaining</span>
                                    <span className="text-gray-900 dark:text-white">{new Intl.NumberFormat('en-IN').format(redis_inventory)}</span>
                                </div>
                                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-1000 ${capacityLeft > 20 ? 'bg-emerald-500' : 'bg-orange-500'
                                            }`}
                                        style={{ width: `${Math.max(capacityLeft, 1)}%` }}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Booking Form Layout */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-lg p-8 sm:p-12">
                    <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Secure Your Tickets</h2>

                    <form
                        onSubmit={(e) => {
                            if (!auth.user) {
                                e.preventDefault();
                                window.location.href = route('events.checkout-auth', event.id);
                                return;
                            }
                            handleSubmit(e);
                        }}
                        className="flex flex-col gap-8"
                    >
                        <div>
                            <label className="block text-sm font-semibold mb-3 text-gray-900 dark:text-white">Select Quantity</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((n) => (
                                    <label
                                        key={n}
                                        className={`relative flex cursor-pointer rounded-xl border-2 p-4 focus:outline-none transition-all ${data.quantity === n
                                            ? 'border-purple-600 bg-purple-50 dark:border-purple-500 dark:bg-purple-900/20 shadow-md'
                                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-800 hover:bg-gray-50 dark:hover:bg-gray-800'
                                            } ${isSoldOut ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <input
                                            type="radio"
                                            name="quantity"
                                            value={n}
                                            className="sr-only"
                                            checked={data.quantity === n}
                                            onChange={(e) => setData('quantity', parseInt(e.target.value))}
                                            disabled={isSoldOut || processing}
                                        />
                                        <div className="flex flex-col text-center w-full">
                                            <span className={`text-xl font-bold ${data.quantity === n ? 'text-purple-700 dark:text-purple-300' : 'text-gray-900 dark:text-white'}`}>{n}</span>
                                            <span className={`text-xs mt-1 ${data.quantity === n ? 'text-purple-600 dark:text-purple-400' : 'text-gray-500'}`}>
                                                {n === 1 ? 'Ticket' : 'Tickets'}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            {errors.quantity && <p className="mt-3 text-sm text-red-500 font-medium">{errors.quantity}</p>}
                            {errors.event_id && <p className="mt-3 text-sm text-red-500 font-medium">{errors.event_id}</p>}
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-900/40 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Price</p>
                                <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-500">
                                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(event.price * data.quantity)}
                                </p>
                            </div>

                            <button
                                type="submit"
                                disabled={isSoldOut || processing}
                                className="relative px-8 py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold shadow-xl shadow-gray-900/20 dark:shadow-white/10 hover:-translate-y-1 hover:shadow-2xl hover:shadow-gray-900/30 dark:hover:shadow-white/20 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed"
                            >
                                {isSoldOut ? 'Event is Sold Out' : (auth.user ? 'Checkout & Pay' : 'Login to Book Tickets')}
                            </button>
                        </div>
                    </form>
                </div>

            </main>

            <style>{`
                @keyframes slideDown {
                    from { opacity: 0; transform: translate(-50%, -20px); }
                    to { opacity: 1; transform: translate(-50%, 0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleUp {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
