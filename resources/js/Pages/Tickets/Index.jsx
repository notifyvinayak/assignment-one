import { Head, Link } from '@inertiajs/react';
import ThemeToggle from '@/Components/ThemeToggle';

// ── Status Pill ────────────────────────────────────────────────────
function StatusPill({ status }) {
    const styles = {
        confirmed: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
        pending: 'bg-yellow-500/10 text-yellow-600 dark:bg-yellow-500/20 dark:text-yellow-400',
        cancelled: 'bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400',
    };

    const dotStyles = {
        confirmed: 'bg-emerald-500',
        pending: 'bg-yellow-500',
        cancelled: 'bg-red-500',
    };

    const label = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${dotStyles[status] || dotStyles.pending}`} />
            {label}
        </span>
    );
}

// ── Ticket Card ────────────────────────────────────────────────────
function TicketCard({ booking }) {
    const formattedPrice = new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(booking.event.price * booking.quantity);

    const formattedDate = new Date(booking.created_at).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });

    return (
        <div className="group relative flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-purple-200 dark:hover:border-purple-900/50 transition-all duration-300 overflow-hidden hover:-translate-y-1">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />

            <div className="p-6">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <Link href={route('events.show', booking.event.id)} className="group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                            <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                                {booking.event.name}
                            </h3>
                        </Link>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                            Booking ID: #{booking.id}
                        </p>
                    </div>
                    <StatusPill status={booking.status} />
                </div>

                <div className="mt-6 p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 flex justify-between items-center text-sm">
                    <div className="flex flex-col">
                        <span className="text-gray-500 dark:text-gray-400">Tickets</span>
                        <span className="font-bold text-gray-900 dark:text-white">{booking.quantity}x</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-gray-500 dark:text-gray-400">Booked on</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formattedDate}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-gray-500 dark:text-gray-400">Total</span>
                        <span className="font-bold text-purple-600 dark:text-purple-400">{formattedPrice}</span>
                    </div>
                </div>

                <div className="mt-5">
                    <Link
                        href={route('events.show', booking.event.id)}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 transition-all hover:border-purple-500 hover:text-purple-600 dark:hover:border-purple-500 dark:hover:text-purple-400"
                    >
                        View Event Page
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ── Empty State ────────────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-gray-200 bg-white px-6 py-20 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 dark:from-purple-500/20 dark:to-indigo-500/20 shadow-inner mb-6 transform -rotate-6">
                <svg className="h-10 w-10 text-purple-500 transform rotate-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                No tickets found
            </h3>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-center max-w-sm">
                You haven't secured any spots yet. Don't miss out on amazing live experiences!
            </p>
            <Link
                href="/"
                className="mt-8 inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-purple-500/30 transition-all hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5"
            >
                Discover Events
            </Link>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────
export default function Index({ bookings, auth }) {
    const totalTickets = bookings?.reduce((sum, b) => sum + b.quantity, 0) || 0;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 font-sans selection:bg-purple-500 selection:text-white pb-24">
            <Head title="My Tickets" />

            {/* ── Navbar ────────────────────────────────────────────── */}
            <nav className="fixed w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-200 dark:bg-gray-900/80 dark:border-gray-800">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="h-8 w-8 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <span className="font-bold text-xl tracking-tight hidden sm:block">TicketFlow</span>
                    </Link>

                    <div className="flex gap-4 items-center">
                        <ThemeToggle />
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mr-2">
                            Welcome, {auth.user.name}
                        </span>
                        <Link href={route('profile.edit')} className="px-4 py-2 text-sm font-bold text-gray-700 bg-gray-100 rounded-full hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700 transition">
                            Profile
                        </Link>
                        <Link method="post" href={route('logout')} as="button" className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 rounded-full hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 transition cursor-pointer">
                            Log out
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ── Main Content ──────────────────────────────────────── */}
            <main className="pt-32 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-extrabold tracking-tight">My Tickets</h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">View and manage all your upcoming event bookings.</p>
                    </div>
                    {totalTickets > 0 && (
                        <div className="inline-flex items-center gap-2 bg-purple-50 border border-purple-100 dark:bg-purple-500/10 dark:border-purple-500/20 px-4 py-2 rounded-xl text-purple-700 dark:text-purple-300 font-bold shrink-0">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                            {totalTickets} Total Tickets
                        </div>
                    )}
                </div>

                {!bookings || bookings.length === 0 ? (
                    <EmptyState />
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {bookings.map((booking) => (
                            <TicketCard key={booking.id} booking={booking} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
