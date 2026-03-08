import React from 'react';
import { motion } from 'framer-motion';
import {
    ClipboardList,
    ShieldAlert,
    BrainCircuit,
    Heart,
    Users2,
    FileText,
    Lock,
    Globe,
    Zap,
    CheckCircle2,
    ArrowDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Spline from '@splinetool/react-spline';

class SplineErrorBoundary extends React.Component {
    state = { hasError: false };
    static getDerivedStateFromError() {
        return { hasError: true };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #dbeafe 0%, #ede9fe 50%, #fce7f3 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                    <span style={{ fontSize: '3rem', opacity: 0.3 }}>🏥</span>
                </div>
            );
        }
        return this.props.children;
    }
}

const fadeUp = {
    hidden: { opacity: 0, y: 28 },
    visible: (i = 0) => ({
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
    }),
};

const agents = [
    {
        icon: <ClipboardList size={22} className="text-blue-600" />,
        bg: 'bg-blue-50',
        title: 'The Handoff Agent',
        desc: 'AI-generated pre-visit briefings summarising medications, mood trends, and care notes — so every PSW walks in fully prepared.',
    },
    {
        icon: <ShieldAlert size={22} className="text-red-500" />,
        bg: 'bg-red-50',
        title: 'Medication Sentinel',
        desc: 'Automated nightly medication audits that flag discrepancies and ensure clinical accuracy across your entire client roster.',
    },
    {
        icon: <Heart size={22} className="text-rose-500" />,
        bg: 'bg-rose-50',
        title: 'Family Comms Agent',
        desc: "Personalised, AI-drafted family updates — warm, clear, and tailored to each family's communication preferences.",
    },
];

const roles = [
    {
        title: 'Personal Support Workers',
        desc: 'AI briefings before every visit, structured logging, and adaptive care memory that learns from each interaction.',
        link: '/psw',
        color: 'text-blue-600',
        border: 'border-blue-200',
        chipBg: 'bg-blue-50',
        chipColor: 'text-blue-700',
        features: ['Pre-visit AI briefings', 'Voice-friendly visit logging', 'Document upload & RAG'],
    },
    {
        title: 'Families',
        desc: 'Real-time care updates, medication transparency, and secure document access — no matter the distance.',
        link: '/family',
        color: 'text-rose-500',
        border: 'border-rose-200',
        chipBg: 'bg-rose-50',
        chipColor: 'text-rose-600',
        features: ['Daily care summaries', 'Medication tracking', 'Secure document vault'],
    },
    {
        title: 'Coordinators',
        desc: 'Full clinical oversight — roster management, sentinel dashboards, compliance logs, and instant escalation.',
        link: '/coordinator',
        color: 'text-indigo-600',
        border: 'border-indigo-200',
        chipBg: 'bg-indigo-50',
        chipColor: 'text-indigo-700',
        features: ['Global sentinel dashboard', 'Role & access control', 'Audit-ready compliance'],
    },
];

const techStack = [
    { icon: <Globe size={18} />, label: 'Vultr Cloud Compute', detail: 'Toronto data residency', color: 'text-emerald-600' },
    { icon: <Lock size={18} />, label: 'Auth0 RBAC', detail: 'Clinical-grade security', color: 'text-indigo-600' },
    { icon: <BrainCircuit size={18} />, label: 'Backboard.io', detail: 'Persistent AI memory', color: 'text-violet-600' },
    { icon: <FileText size={18} />, label: 'Vultr Object Storage', detail: 'S3-compatible documents', color: 'text-blue-600' },
    { icon: <Zap size={18} />, label: 'Redis + Bull', detail: 'Async job processing', color: 'text-amber-600' },
    { icon: <Users2 size={18} />, label: 'PostgreSQL', detail: 'Vultr Managed Database', color: 'text-cyan-600' },
];

const stats = [
    { value: '3', label: 'AI Agents' },
    { value: '24/7', label: 'Monitoring' },
    { value: '100%', label: 'Canadian Hosted' },
    { value: '<2s', label: 'Briefing Time' },
];

export default function LandingPage() {
    return (
        <div className="bg-white min-h-screen">
            {/* ─── HERO: Spline 3D fills the viewport ─── */}
            <section style={{ position: 'relative', height: '100vh', width: '100%' }}>
                <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
                    <SplineErrorBoundary>
                        <Spline scene="https://prod.spline.design/xdWX96OncUhXEm9L/scene.splinecode" />
                    </SplineErrorBoundary>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2, duration: 1 }}
                    style={{
                        position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
                        zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    }}
                >
                    <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        Scroll to explore
                    </span>
                    <motion.div
                        animate={{ y: [0, 6, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <ArrowDown size={16} style={{ color: '#94a3b8' }} />
                    </motion.div>
                </motion.div>
            </section>

            {/* ─── STATS BAR ─── */}
            <section className="border-b border-gray-100 bg-gray-50 py-14 px-6">
                <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    {stats.map((s, i) => (
                        <motion.div
                            key={i}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={i}
                        >
                            <div className="text-3xl font-bold text-blue-600 mb-1">{s.value}</div>
                            <div className="text-sm text-gray-500">{s.label}</div>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* ─── WHAT IS CARESYNC ─── */}
            <section className="py-24 px-6 bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}>
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-3">
                            What Is CareSync
                        </p>
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight mb-5 leading-tight">
                            The Care Coordination OS{' '}
                            <span className="text-blue-600">for Canada</span>
                        </h2>
                        <p className="text-gray-500 text-lg leading-relaxed max-w-2xl mx-auto">
                            CareSync gives Personal Support Workers intelligent pre-visit briefings,
                            keeps families informed with personalised daily updates, and provides
                            coordinators with complete clinical oversight — all running on
                            Canadian infrastructure with enterprise-grade security.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* ─── AI AGENTS ─── */}
            <section className="py-20 px-6 bg-gray-50 border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
                        className="mb-12 text-center"
                    >
                        <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
                            Intelligence Layer
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                            Three AI Agents. One Seamless Platform.
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Each agent runs on persistent memory threads powered by Backboard.io,
                            building richer context with every interaction.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {agents.map((a, i) => (
                            <motion.div
                                key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                                className="bg-white border border-gray-100 rounded-2xl p-7 hover:border-gray-200 hover:shadow-md transition-all duration-300"
                            >
                                <div className={`w-11 h-11 ${a.bg} rounded-xl flex items-center justify-center mb-5`}>
                                    {a.icon}
                                </div>
                                <h3 className="font-semibold text-gray-900 text-base mb-2">{a.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── THREE ROLES ─── */}
            <section className="py-20 px-6 bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
                        className="mb-12 text-center"
                    >
                        <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
                            Role-Based Access
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                            One Platform. Three Experiences.
                        </h2>
                        <p className="text-gray-500 max-w-xl mx-auto">
                            Every role sees exactly what they need — secured by Auth0
                            with clinical-grade role-based access control.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-5">
                        {roles.map((r, i) => (
                            <motion.div
                                key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i}
                                className={`bg-white border ${r.border} rounded-2xl p-7 hover:shadow-md transition-all duration-300 flex flex-col`}
                            >
                                <h3 className={`font-semibold text-base mb-2 ${r.color}`}>{r.title}</h3>
                                <p className="text-sm text-gray-500 leading-relaxed mb-5 flex-1">{r.desc}</p>
                                <ul className="space-y-2 mb-5">
                                    {r.features.map((f, fi) => (
                                        <li key={fi} className="flex items-center gap-2 text-sm text-gray-600">
                                            <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                                            {f}
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to={r.link}
                                    className={`text-sm font-semibold ${r.color} hover:underline`}
                                >
                                    Learn more →
                                </Link>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── HOW IT WORKS ─── */}
            <section className="py-20 px-6 bg-gray-50 border-b border-gray-100">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
                        className="mb-12 text-center"
                    >
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
                            How It Works
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                            From Login to Logged Visit in Minutes
                        </h2>
                    </motion.div>

                    <div className="space-y-3">
                        {[
                            { step: '01', title: 'Coordinator Creates a Client', desc: 'Client profile is saved to the Vultr Managed Database and a Backboard AI memory thread is provisioned automatically.' },
                            { step: '02', title: 'PSW Gets Assigned & Briefed', desc: 'The Handoff Agent generates a pre-visit briefing from all prior visits, medications, mood trends, and uploaded documents.' },
                            { step: '03', title: 'Visit Logged & Memory Updated', desc: "After the visit, notes and vitals are persisted to PostgreSQL and written to the client's AI memory thread for future context." },
                            { step: '04', title: 'Family Receives an Update', desc: 'The Family Comms Agent drafts a warm, personalised summary and delivers it through the Family Portal.' },
                            { step: '05', title: 'Sentinel Runs Overnight', desc: "At 2 AM Toronto time, the Medication Sentinel audits every client's medication log and flags any discrepancies." },
                        ].map((s, i) => (
                            <motion.div
                                key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.12}
                                className="flex items-start gap-5 bg-white border border-gray-100 rounded-xl px-6 py-5 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
                            >
                                <span className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {s.step}
                                </span>
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-1">{s.title}</h4>
                                    <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── TECH STACK ─── */}
            <section className="py-20 px-6 bg-white border-b border-gray-100">
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
                        className="mb-12 text-center"
                    >
                        <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">
                            Infrastructure
                        </p>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-3">
                            Built on Vultr. Secured by Auth0. Powered by AI.
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            Canadian data residency. Enterprise-grade security.
                            Cloud-native from day one.
                        </p>
                    </motion.div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {techStack.map((t, i) => (
                            <motion.div
                                key={i}
                                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={i * 0.08}
                                className="flex items-center gap-3 bg-gray-50 border border-gray-100 rounded-xl px-4 py-4 hover:border-gray-200 transition-all duration-200"
                            >
                                <div className={`${t.color} flex-shrink-0`}>{t.icon}</div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">{t.label}</div>
                                    <div className="text-xs text-gray-400">{t.detail}</div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── CLOSING ─── */}
            <section
                style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}
                className="py-20 px-6"
            >
                <motion.div
                    initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} custom={0}
                    className="max-w-2xl mx-auto text-center"
                >
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
                        Better Handoffs. Safer Clients. Informed Families.
                    </h2>
                    <p className="text-blue-100 text-base leading-relaxed">
                        CareSync is the care coordination platform that Canadian home-care
                        teams have been waiting for.
                    </p>
                </motion.div>

                <div style={{
                    marginTop: '3rem', paddingTop: '1.5rem',
                    borderTop: '1px solid rgba(255,255,255,0.15)',
                    textAlign: 'center',
                    fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)',
                }}>
                    CareSync &copy; {new Date().getFullYear()} &middot; Built for Vultr Hackathon
                </div>
            </section>
        </div>
    );
}
