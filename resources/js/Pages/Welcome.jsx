import { Head, Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Welcome({ auth, events }) {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-black text-gray-900 dark:text-gray-100 font-sans selection:bg-purple-500 selection:text-white">
            <Head title="Events" />

            {/* ── Spotlight / Glow Effects ────────────────────────────── */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/40 blur-[120px] rounded-full mix-blend-screen animate-[pulse_8s_ease-in-out_infinite]" />
                <div className="absolute top-[20%] right-[-10%] w-[40%] h-[60%] bg-indigo-900/30 blur-[120px] rounded-full mix-blend-screen animate-[pulse_10s_ease-in-out_infinite_reverse]" />
                <div className="absolute bottom-[-20%] left-[20%] w-[60%] h-[50%] bg-fuchsia-900/20 blur-[150px] rounded-full mix-blend-screen animate-[pulse_12s_ease-in-out_infinite]" />
            </div>

            {/* ── Navbar ────────────────────────────────────────────── */}
            <nav className="fixed w-full z-50 bg-black/50 backdrop-blur-xl border-b border-white/10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl shadow-lg shadow-purple-500/20 flex items-center justify-center">
                                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                </svg>
                            </div>
                            <span className="font-black text-2xl tracking-tighter text-gray-900 dark:text-white uppercase mt-1">TicketFlow</span>
                        </div>

                        <div className="flex items-center space-x-6">
                            <ThemeToggle />
                            {auth.user ? (
                                <>
                                    <Link
                                        href={route('tickets.index')}
                                        className="px-6 py-2.5 text-sm font-bold text-black bg-white rounded-full hover:bg-gray-200 shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all hover:scale-105"
                                    >
                                        My Tickets
                                    </Link>
                                    <Link method="post" href={route('logout')} as="button" className="px-6 py-2.5 text-sm font-bold text-white bg-white/10 rounded-full hover:bg-white/20 transition-all cursor-pointer">
                                        Log out
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <Link href={route('login')} className="text-sm font-bold text-gray-300 hover:text-white transition">
                                        Log in
                                    </Link>
                                    <Link
                                        href={route('register')}
                                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full hover:from-purple-500 hover:to-indigo-500 shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all hover:scale-105"
                                    >
                                        Register Now
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* ── Hero Section ──────────────────────────────────────── */}
            <div className="relative z-10 pt-40 pb-20 sm:pt-48 sm:pb-32 lg:pb-40 px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center justify-center min-h-[70vh]">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 backdrop-blur-md mb-8 animate-[fadeInDown_1s_ease-out]">
                    <span className="flex h-2 w-2 rounded-full bg-purple-500 animate-ping absolute"></span>
                    <span className="h-2 w-2 rounded-full bg-purple-500 relative"></span>
                    <span className="text-xs font-bold tracking-widest text-purple-300 uppercase">Music of the Spheres World Tour</span>
                </div>

                <h1 className="text-6xl font-black tracking-tighter text-gray-900 dark:text-white sm:text-8xl lg:text-9xl mb-6 uppercase animate-[fadeInUp_1s_ease-out]">
                    Experience <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-400 to-indigo-400 drop-shadow-[0_0_40px_rgba(168,85,247,0.5)]">
                        The Magic.
                    </span>
                </h1>

                <p className="mt-4 max-w-2xl text-xl text-gray-400 font-medium animate-[fadeInUp_1.2s_ease-out]">
                    Secure your spot instantly with our blazing-fast atomic ticket queue. Built for massive scale. Ready when you are.
                </p>
            </div>

            {/* ── Events Grid ───────────────────────────────────────── */}
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
                <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tight">Available Shows</h2>
                </div>

                {events && events.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {events.map((event) => (
                            <Link
                                href={route('events.show', event.id)}
                                key={event.id}
                                className="group relative flex flex-col bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/10 hover:border-purple-500/50 transition-all duration-500 overflow-hidden hover:-translate-y-2 shadow-xl dark:shadow-none hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)]"
                            >
                                {/* Image Placeholder Banner */}
                                <div className="h-56 bg-black relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/40 to-indigo-900/40 mix-blend-overlay group-hover:scale-110 transition-transform duration-700 ease-out" />
                                    {/* Abstract shapes inside banner */}
                                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-purple-500/30 blur-2xl rounded-full" />
                                    <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/30 blur-2xl rounded-full" />

                                    <div className="absolute top-5 left-5 bg-black/60 backdrop-blur-md text-xs font-bold px-4 py-2 rounded-full text-white shadow-lg uppercase tracking-wider border border-white/10">
                                        Selling Fast
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-8 flex-1 flex flex-col relative">
                                    <h3 className="text-2xl font-black text-gray-900 dark:text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-indigo-400 transition-all duration-300">
                                        {event.name}
                                    </h3>

                                    <div className="mt-8 flex items-center justify-between mt-auto">
                                        <div className="flex flex-col">
                                            <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-1">Starting At</span>
                                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                                {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(event.price)}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold mb-1">Capacity</span>
                                            <span className="text-lg font-bold text-gray-600 dark:text-gray-300">{new Intl.NumberFormat('en-IN').format(event.total_tickets)}</span>
                                        </div>
                                    </div>

                                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-white/10 flex items-center justify-between text-purple-600 dark:text-purple-400 font-bold uppercase tracking-widest text-sm dark:group-hover:text-purple-300 transition-colors">
                                        <span>Secure Tickets</span>
                                        <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/40 transition-colors">
                                            <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-32 bg-white dark:bg-white/5 backdrop-blur-md rounded-3xl border border-gray-200 dark:border-white/10 shadow-xl dark:shadow-none">
                        <p className="text-gray-500 dark:text-gray-400 text-lg">No tour dates announced yet.</p>
                    </div>
                )}
            </div>

            {/* ── Footer ────────────────────────────────────────────── */}
            <footer className="relative z-10 border-t border-gray-200 dark:border-white/10 bg-white/80 dark:bg-black/50 backdrop-blur-md py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-500 to-indigo-500 rounded shadow-lg shadow-purple-500/20 flex items-center justify-center">
                            <svg className="w-5 h-5 text-white animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <span className="font-black text-gray-900 dark:text-white text-xl tracking-tighter uppercase mt-1">TicketFlow</span>
                    </div>
                    <p className="text-sm text-gray-600 font-medium">
                        &copy; {new Date().getFullYear()} TicketFlow Inc. Production-ready atomic architectures.
                    </p>
                </div>
            </footer>

            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeInDown {
                    from { opacity: 0; transform: translateY(-20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
