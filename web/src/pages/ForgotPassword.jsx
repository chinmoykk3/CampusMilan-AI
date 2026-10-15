import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2, Mail, Lock, KeyRound, ShieldAlert, CheckCircle2, ArrowLeft, RefreshCw, MapPin, Eye, EyeOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const RESEND_COOLDOWN = 60; // seconds

const slideVariants = {
    enter: (direction) => ({ x: direction > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({ x: direction < 0 ? 60 : -60, opacity: 0 }),
};

const ForgotPassword = () => {
    const navigate = useNavigate();
    const { forgotPassword, verifyResetOtp, resetPassword } = useAuthStore();

    // Step: 1 = email, 2 = otp, 3 = new password, 4 = success
    const [step, setStep] = useState(1);
    const [direction, setDirection] = useState(1);
    const [loading, setLoading] = useState(false); // local loading — avoids conflict with checkAuth

    // Form state
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [resetToken, setResetToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [localError, setLocalError] = useState('');

    // OTP timer
    const [countdown, setCountdown] = useState(RESEND_COOLDOWN);
    const [canResend, setCanResend] = useState(false);
    const timerRef = useRef(null);

    const otpRefs = useRef([]);

    const startTimer = () => {
        setCountdown(RESEND_COOLDOWN);
        setCanResend(false);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    setCanResend(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => () => clearInterval(timerRef.current), []);

    const goToStep = (next) => {
        setDirection(next > step ? 1 : -1);
        setStep(next);
        setLocalError('');
    };

    // ── Step 1: Request OTP ──────────────────────────────────────────────────
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (!email) { setLocalError('Please enter your email address.'); return; }
        setLoading(true);
        try {
            await forgotPassword(email);
            toast.success('OTP sent! Check your inbox.');
            startTimer();
            goToStep(2);
        } catch (err) {
            const msg = err.response?.data?.message
                || (err.code === 'ERR_NETWORK' ? 'Cannot reach server. Make sure the backend is running.' : 'Failed to send OTP. Try again.');
            setLocalError(msg);
        } finally {
            setLoading(false);
        }
    };

    // ── Step 2: Verify OTP ───────────────────────────────────────────────────
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const next = [...otp];
        next[index] = value.slice(-1);
        setOtp(next);
        if (value && index < 5) otpRefs.current[index + 1]?.focus();
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e) => {
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (pasted.length === 6) {
            setOtp(pasted.split(''));
            otpRefs.current[5]?.focus();
        }
        e.preventDefault();
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLocalError('');
        const code = otp.join('');
        if (code.length < 6) { setLocalError('Please enter the complete 6-digit OTP.'); return; }
        setLoading(true);
        try {
            const res = await verifyResetOtp(email, code);
            setResetToken(res.resetToken);
            toast.success('OTP verified!');
            goToStep(3);
        } catch (err) {
            setLocalError(err.response?.data?.message || 'Invalid or expired OTP.');
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        setLocalError('');
        setLoading(true);
        try {
            await forgotPassword(email);
            setOtp(['', '', '', '', '', '']);
            toast.success('A new OTP has been sent.');
            startTimer();
        } catch (err) {
            setLocalError('Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ── Step 3: Set New Password ─────────────────────────────────────────────
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLocalError('');
        if (newPassword.length < 8) { setLocalError('Password must be at least 8 characters.'); return; }
        if (newPassword !== confirmPassword) { setLocalError('Passwords do not match.'); return; }
        setLoading(true);
        try {
            await resetPassword(resetToken, newPassword);
            goToStep(4);
        } catch (err) {
            setLocalError(err.response?.data?.message || 'Failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    // ── Shared Error / Icon ──────────────────────────────────────────────────
    const ErrorBox = () => localError ? (
        <div className="mb-5 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/40 rounded-xl flex items-center gap-3 text-red-700 dark:text-red-400">
            <ShieldAlert className="w-5 h-5 shrink-0 text-red-600 dark:text-red-400" />
            <span className="text-sm font-bold">{localError}</span>
        </div>
    ) : null;

    const stepTitles = ['Forgot Password', 'Verify OTP', 'New Password', 'All Done!'];
    const stepSubtitles = [
        "Enter your registered email and we'll send you a 6-digit OTP.",
        `We sent a code to ${email}. Enter it below.`,
        'Almost there! Choose a strong new password.',
        'Your password has been reset successfully.',
    ];

    return (
        <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 bg-slate-50 dark:bg-stone-950">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-md w-full premium-card p-8 sm:p-10 bg-white dark:bg-stone-900 border border-slate-200 dark:border-stone-800 rounded-2xl shadow-sm"
            >
                {/* Header */}
                <div className="text-center mb-8 flex flex-col items-center">
                    <div className="bg-primary-600 text-white p-2.5 rounded-xl mb-6 shadow-sm">
                        {step === 4 ? <CheckCircle2 className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
                    </div>
                    <h2 className="text-3xl font-extrabold text-primary-900 dark:text-white tracking-tight">{stepTitles[step - 1]}</h2>
                    <p className="text-slate-600 dark:text-stone-400 mt-2 font-medium text-sm text-center px-2">{stepSubtitles[step - 1]}</p>
                </div>

                {/* Step progress dots */}
                {step < 4 && (
                    <div className="flex justify-center gap-2 mb-7">
                        {[1, 2, 3].map((s) => (
                            <div
                                key={s}
                                className={`h-2 rounded-full transition-all duration-300 ${step === s ? 'w-8 bg-primary-600' : step > s ? 'w-2 bg-primary-400' : 'w-2 bg-slate-200 dark:bg-stone-800'}`}
                            />
                        ))}
                    </div>
                )}

                <ErrorBox />

                <AnimatePresence mode="wait" custom={direction}>
                    {/* ── STEP 1: EMAIL ─────────────────────────────────────── */}
                    {step === 1 && (
                        <motion.form
                            key="step1"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            onSubmit={handleRequestOtp}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-bold text-primary-900 dark:text-stone-200 mb-2">Email Address</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-stone-500">
                                        <Mail className="h-5 w-5" />
                                    </div>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        autoFocus
                                        className="block w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all placeholder:text-slate-500 dark:placeholder:text-stone-500 font-medium"
                                        placeholder="you@student.edu"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="premium-button w-full flex items-center justify-center py-3.5 px-4 outline-none focus-visible:ring-4 focus-visible:ring-primary-100 disabled:opacity-75"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
                            </button>
                        </motion.form>
                    )}

                    {/* ── STEP 2: OTP ───────────────────────────────────────── */}
                    {step === 2 && (
                        <motion.form
                            key="step2"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            onSubmit={handleVerifyOtp}
                            className="space-y-6"
                        >
                            {/* 6-digit OTP boxes */}
                            <div>
                                <label className="block text-sm font-bold text-primary-900 dark:text-stone-200 mb-4 text-center">Enter 6-digit OTP</label>
                                <div className="flex justify-center gap-2.5" onPaste={handleOtpPaste}>
                                    {otp.map((digit, i) => (
                                        <input
                                            key={i}
                                            ref={(el) => (otpRefs.current[i] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(i, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(i, e)}
                                            className={`w-11 h-13 text-center text-xl font-bold border-2 rounded-xl bg-slate-50 dark:bg-stone-800 text-primary-900 dark:text-white focus:outline-none transition-all
                                                ${digit ? 'border-primary-500 dark:border-violet-500 bg-primary-50 dark:bg-violet-950/30' : 'border-slate-200 dark:border-stone-700'}
                                                focus:border-primary-600 focus:ring-2 focus:ring-primary-100`}
                                            style={{ height: '52px' }}
                                            autoFocus={i === 0}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Countdown + Resend */}
                            <div className="text-center text-sm">
                                {canResend ? (
                                    <button
                                        type="button"
                                        onClick={handleResend}
                                        disabled={loading}
                                        className="inline-flex items-center gap-1.5 font-bold text-primary-600 dark:text-violet-400 hover:text-primary-700 dark:hover:text-violet-300 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" /> Resend OTP
                                    </button>
                                ) : (
                                    <span className="text-slate-500 dark:text-stone-400">
                                        Resend in <span className="font-bold text-primary-600 dark:text-violet-400">{countdown}s</span>
                                    </span>
                                )}
                            </div>

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => goToStep(1)}
                                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 dark:border-stone-700 text-slate-600 dark:text-stone-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-stone-800 transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || otp.join('').length < 6}
                                    className="premium-button flex-1 flex items-center justify-center py-3 px-4 outline-none focus-visible:ring-4 focus-visible:ring-primary-100 disabled:opacity-75"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify OTP'}
                                </button>
                            </div>
                        </motion.form>
                    )}

                    {/* ── STEP 3: NEW PASSWORD ──────────────────────────────── */}
                    {step === 3 && (
                        <motion.form
                            key="step3"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            onSubmit={handleResetPassword}
                            className="space-y-5"
                        >
                            <div>
                                <label className="block text-sm font-bold text-primary-900 dark:text-stone-200 mb-2">New Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-stone-500">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        autoFocus
                                        className="block w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all placeholder:text-slate-500 dark:placeholder:text-stone-500 font-medium"
                                        placeholder="Min. 8 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((v) => !v)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-stone-500 hover:text-slate-600 dark:hover:text-stone-300"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {/* Strength bar */}
                                {newPassword && (
                                    <div className="mt-2 flex gap-1">
                                        {[1, 2, 3, 4].map((lvl) => {
                                            const strength = newPassword.length >= 12 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && /[^A-Za-z0-9]/.test(newPassword) ? 4
                                                : newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) ? 3
                                                    : newPassword.length >= 8 ? 2 : 1;
                                            return (
                                                <div key={lvl} className={`h-1.5 flex-1 rounded-full transition-all ${lvl <= strength
                                                    ? strength === 1 ? 'bg-red-400'
                                                        : strength === 2 ? 'bg-amber-400'
                                                            : strength === 3 ? 'bg-blue-400' : 'bg-emerald-500'
                                                    : 'bg-slate-200 dark:bg-stone-800'}`} />
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-primary-900 dark:text-stone-200 mb-2">Confirm Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 dark:text-stone-500">
                                        <Lock className="h-5 w-5" />
                                    </div>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="block w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-stone-800 border border-slate-200 dark:border-stone-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-600 focus:border-transparent transition-all placeholder:text-slate-500 dark:placeholder:text-stone-500 font-medium"
                                        placeholder="Re-enter password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm((v) => !v)}
                                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 dark:text-stone-500 hover:text-slate-600 dark:hover:text-stone-300"
                                    >
                                        {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {confirmPassword && newPassword !== confirmPassword && (
                                    <p className="text-xs text-red-500 dark:text-red-400 mt-1.5 font-medium">Passwords do not match</p>
                                )}
                                {confirmPassword && newPassword === confirmPassword && (
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Passwords match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="premium-button w-full flex items-center justify-center py-3.5 px-4 outline-none focus-visible:ring-4 focus-visible:ring-primary-100 disabled:opacity-75 mt-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Reset Password'}
                            </button>
                        </motion.form>
                    )}

                    {/* ── STEP 4: SUCCESS ───────────────────────────────────── */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            custom={direction}
                            variants={slideVariants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="text-center space-y-6"
                        >
                            <div className="flex justify-center">
                                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-950/40 flex items-center justify-center">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                </div>
                            </div>
                            <p className="text-slate-600 dark:text-stone-400 font-medium">
                                You can now sign in with your new password.
                            </p>
                            <button
                                onClick={() => navigate('/login')}
                                className="premium-button w-full flex items-center justify-center py-3.5 px-4 outline-none focus-visible:ring-4 focus-visible:ring-primary-100"
                            >
                                Back to Sign In
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Bottom link */}
                {step < 4 && (
                    <div className="mt-7 pt-5 border-t border-slate-100 dark:border-stone-800 text-center text-sm font-medium text-slate-500 dark:text-stone-400">
                        Remembered it?{' '}
                        <Link to="/login" className="font-bold text-primary-600 dark:text-violet-400 hover:text-primary-700 dark:hover:text-violet-300 outline-none focus-visible:underline">
                            Back to Sign In
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
