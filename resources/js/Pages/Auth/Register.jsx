import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        return () => {
            reset('password', 'password_confirmation');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-500 selection:text-white">
            <Head title="Register" />
            <div className="fixed top-6 right-6 z-50">
                <ThemeToggle />
            </div>

            <div className="max-w-md w-full animate-[fadeIn_0.5s_ease-out]">
                {/* Logo & Headline */}
                <div className="text-center mb-10">
                    <Link href="/" className="inline-flex items-center gap-2 mb-6">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                            </svg>
                        </div>
                        <span className="font-extrabold text-2xl tracking-tight text-gray-900 dark:text-white">TicketFlow</span>
                    </Link>
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Create an account</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Join millions of fans. Secure real-time atomic locks instantly.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 mt-8">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="name">
                                Full Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                className="block w-full rounded-xl border-gray-300 bg-gray-50 py-3 px-4 text-sm focus:border-purple-500 focus:bg-white focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:bg-gray-700 transition-colors"
                                required
                                autoFocus
                                autoComplete="name"
                                placeholder="Chris Martin"
                            />
                            {errors.name && <p className="mt-2 text-sm text-red-500">{errors.name}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                className="block w-full rounded-xl border-gray-300 bg-gray-50 py-3 px-4 text-sm focus:border-purple-500 focus:bg-white focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:bg-gray-700 transition-colors"
                                required
                                autoComplete="username"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="password">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="block w-full rounded-xl border-gray-300 bg-gray-50 py-3 px-4 text-sm focus:border-purple-500 focus:bg-white focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:bg-gray-700 transition-colors"
                                required
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2" htmlFor="password_confirmation">
                                Confirm Password
                            </label>
                            <input
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                className="block w-full rounded-xl border-gray-300 bg-gray-50 py-3 px-4 text-sm focus:border-purple-500 focus:bg-white focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:bg-gray-700 transition-colors"
                                required
                                autoComplete="new-password"
                                placeholder="••••••••"
                            />
                            {errors.password_confirmation && <p className="mt-2 text-sm text-red-500">{errors.password_confirmation}</p>}
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="mt-2 w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-purple-500/30 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {processing ? 'Creating account...' : 'Create Account'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <Link
                            href={route('login')}
                            className="w-full flex justify-center py-3.5 px-4 rounded-xl text-sm font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Already have an account? Sign in
                        </Link>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
