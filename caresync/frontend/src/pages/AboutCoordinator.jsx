import React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Users2,
  ShieldCheck,
  Zap,
  CheckCircle2,
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const stats = [
  { value: "250+", label: "Caregivers Managed" },
  { value: "Instant", label: "Flag Resolution" },
  { value: "0", label: "Missed Audits" },
  { value: "Auto", label: "Compliance Engine" },
];

const features = [
  {
    icon: <BarChart3 size={20} className="text-slate-700" />,
    bg: "bg-slate-100",
    title: "Global Sentinel Dashboard",
    desc: "A high-level command view of all clinical flags across your entire roster — surfacing medication risks and behavioural anomalies instantly.",
  },
  {
    icon: <Users2 size={20} className="text-indigo-600" />,
    bg: "bg-indigo-50",
    title: "Role & Access Management",
    desc: "Absolute control over who sees what. Assign staff and family to specific client threads with clinical-level security — no exceptions.",
  },
  {
    icon: <ShieldCheck size={20} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    title: "Audit & Compliance Log",
    desc: "Every visit, medication log, and flag resolution — timestamped and immutable. Generate compliance reports in seconds, not hours.",
  },
  {
    icon: <Zap size={20} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "Instant Escalation Engine",
    desc: "When something looks wrong, coordinators are the first to know. Automated escalation means critical flags reach the right person immediately.",
  },
];

const steps = [
  "Manage Roster & Assignments",
  "Morning Sentinel Audit",
  "Audit Clinical Flags",
  "Coordinate Communications",
];

export default function AboutCoordinator() {
  return (
    <div className="bg-white min-h-screen">
      {/* ─── HERO ─── */}
      <section
        style={{ background: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)" }}
        className="py-32 px-6"
      >
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-200 uppercase tracking-widest bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-300" />
            Operational Command Centre
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5"
          >
            Care Coordination.{" "}
            <span className="text-indigo-200">Total Control.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-blue-100 text-lg leading-relaxed mb-8 max-w-xl mx-auto"
          >
            WardRound gives coordinators a unified command layer — real-time
            clinical visibility, zero-risk oversight, automated compliance, and
            instant escalation across your entire roster.
          </motion.p>

        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="border-b border-gray-100 bg-gray-50 py-14 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              custom={i}
            >
              <div className="text-3xl font-bold text-indigo-600 mb-1">{s.value}</div>
              <div className="text-sm text-gray-500">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-20 px-6 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
            className="mb-12"
          >
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
              Command Tools
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Everything you need to run clinical operations
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl">
              Built for coordinators who need total oversight without drowning in
              noise — intelligent filtering, instant action.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.5}
                className="border border-gray-100 rounded-xl p-6 hover:border-gray-200 hover:shadow-sm transition-all duration-200"
              >
                <div className={`w-9 h-9 ${f.bg} rounded-lg flex items-center justify-center mb-4`}>
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── WORKFLOW ─── */}
      <section className="py-20 px-6 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-widest mb-2">
              Workflow Optimisation
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
              Your daily operations, codified
            </h2>
            <p className="text-gray-500 leading-relaxed mb-6">
              A structured daily protocol that ensures no client ever falls
              through the cracks — from morning audit to end-of-day compliance
              check.
            </p>
          </motion.div>

          <div className="space-y-3">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                custom={i * 0.15}
                className="flex items-center gap-4 bg-white border border-gray-100 rounded-xl px-5 py-4"
              >
                <span className="w-7 h-7 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-gray-800">{step}</span>
                <CheckCircle2 size={16} className="text-indigo-200 ml-auto" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-6 bg-indigo-600">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Run your service with complete confidence
          </h2>
          <p className="text-indigo-100 mb-7 text-base">
            WardRound gives coordinators the visibility and control they need to
            deliver exceptional care at scale.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
