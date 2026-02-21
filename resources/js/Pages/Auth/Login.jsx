import { Head, Link, useForm } from '@inertiajs/react';
import { useEffect } from 'react';
import ThemeToggle from '@/Components/ThemeToggle';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 selection:bg-purple-500 selection:text-white">
            <Head title="Log in" />
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
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2">Welcome back</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Sign in to your account to secure your tickets instantly.
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 py-8 px-6 sm:px-10 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
                    {status && (
                        <div className="mb-6 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {status}
                        </div>
                    )}

                    <form onSubmit={submit} className="space-y-6">
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
                                autoFocus
                                autoComplete="username"
                                placeholder="you@example.com"
                            />
                            {errors.email && <p className="mt-2 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300" htmlFor="password">
                                    Password
                                </label>
                                {canResetPassword && (
                                    <Link href={route('password.request')} className="text-sm font-medium text-purple-600 hover:text-purple-500 dark:text-purple-400 transition-colors">
                                        Forgot password?
                                    </Link>
                                )}
                            </div>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                className="block w-full rounded-xl border-gray-300 bg-gray-50 py-3 px-4 text-sm focus:border-purple-500 focus:bg-white focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700/50 dark:text-white dark:focus:bg-gray-700 transition-colors"
                                required
                                autoComplete="current-password"
                                placeholder="••••••••"
                            />
                            {errors.password && <p className="mt-2 text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember"
                                type="checkbox"
                                name="remember"
                                checked={data.remember}
                                onChange={(e) => setData('remember', e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-purple-600 focus:ring-purple-500 dark:border-gray-600 dark:bg-gray-700/50"
                            />
                            <label htmlFor="remember" className="ml-2 block text-sm text-gray-600 dark:text-gray-400">
                                Remember me for 30 days
                            </label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-purple-500/30 text-sm font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0"
                            >
                                {processing ? 'Signing in...' : 'Sign in to TicketFlow'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-8 relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Don't have an account?</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <Link
                            href={route('register')}
                            className="w-full flex justify-center py-3.5 px-4 border-2 border-gray-200 dark:border-gray-700 rounded-xl shadow-sm text-sm font-bold text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                        >
                            Create a new account
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
