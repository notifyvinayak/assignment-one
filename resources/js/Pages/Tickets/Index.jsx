import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// ── Status Pill ────────────────────────────────────────────────────
function StatusPill({ status }) {
    const styles = {
        confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
        pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
        cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    };

    const dotStyles = {
        confirmed: 'bg-emerald-500',
        pending: 'bg-yellow-500',
        cancelled: 'bg-red-500',
    };

    const label = status.charAt(0).toUpperCase() + status.slice(1);

    return (
        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${styles[status] || styles.pending}`}>
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
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 dark:border-gray-700 dark:bg-gray-800">
            {/* Colored top strip */}
            <div className="h-1.5 bg-gradient-to-r from-violet-500 to-indigo-500" />

            <div className="p-6">
                {/* Header: Event name + Status */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                            {booking.event.name}
                        </h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
                            Booking #{booking.id}
                        </p>
                    </div>
                    <StatusPill status={booking.status} />
                </div>

                {/* Dashed separator */}
                <div className="my-5 border-t-2 border-dashed border-gray-200 dark:border-gray-700" />

                {/* Details grid */}
                <div className="grid grid-cols-3 gap-4">
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Tickets
                        </p>
                        <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                            {booking.quantity}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Total
                        </p>
                        <p className="mt-1 text-lg font-bold text-violet-600 dark:text-violet-400">
                            {formattedPrice}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-gray-400 dark:text-gray-500">
                            Booked
                        </p>
                        <p className="mt-1 text-sm font-medium text-gray-600 dark:text-gray-400">
                            {formattedDate}
                        </p>
                    </div>
                </div>

                {/* View Event link */}
                <div className="mt-5">
                    <Link
                        href={route('events.show', booking.event.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 transition-colors hover:text-violet-500 dark:text-violet-400 dark:hover:text-violet-300"
                    >
                        View Event
                        <svg className="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    );
}

// ── Empty State ────────────────────────────────────────────────────
function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white px-6 py-16 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 dark:bg-violet-900/30">
                <svg className="h-8 w-8 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                </svg>
            </div>
            <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
                No tickets yet
            </h3>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                You haven't booked any tickets. Browse events to get started!
            </p>
            <Link
                href={route('events.show', 1)}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse Events
            </Link>
        </div>
    );
}

// ── Main Component ─────────────────────────────────────────────────
export default function Index({ bookings }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                        My Tickets
                    </h2>
                    {bookings.length > 0 && (
                        <span className="rounded-full bg-violet-100 px-3 py-1 text-sm font-semibold text-violet-700 dark:bg-violet-900/40 dark:text-violet-300">
                            {bookings.reduce((sum, b) => sum + b.quantity, 0)} ticket{bookings.reduce((sum, b) => sum + b.quantity, 0) !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            }
        >
            <Head title="My Tickets" />

            <div className="py-12">
                <div className="mx-auto max-w-5xl sm:px-6 lg:px-8">
                    {bookings.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                            {bookings.map((booking) => (
                                <TicketCard key={booking.id} booking={booking} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
