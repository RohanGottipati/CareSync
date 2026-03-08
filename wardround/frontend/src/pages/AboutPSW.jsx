import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ClipboardList,
  ShieldAlert,
  Stethoscope,
  BrainCircuit,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: "easeOut" },
  }),
};

const stats = [
  { value: "10k+", label: "Care Hours Logged" },
  { value: "99.9%", label: "Safety Accuracy" },
  { value: "500+", label: "Active Clients" },
  { value: "100%", label: "AI Reliability" },
];

const features = [
  {
    icon: <ClipboardList size={20} className="text-blue-600" />,
    bg: "bg-blue-50",
    title: "The Handoff Agent",
    desc: "CareSync generates specific briefings before every visit — summarising medications, mood changes, and family notes so you walk in fully prepared.",
  },
  {
    icon: <ShieldAlert size={20} className="text-red-600" />,
    bg: "bg-red-50",
    title: "Medication Sentinel",
    desc: "Our AI monitors medication logs 24/7, flagging discrepancies and ensuring every client receives precisely what they need with zero ambiguity.",
  },
  {
    icon: <BrainCircuit size={20} className="text-indigo-600" />,
    bg: "bg-indigo-50",
    title: "Adaptive Care Memory",
    desc: "Every observation you log trains the system to understand each client's baseline, detecting anomalies before they become incidents.",
  },
  {
    icon: <Stethoscope size={20} className="text-emerald-600" />,
    bg: "bg-emerald-50",
    title: "Clinical Visit Logger",
    desc: "Structured, voice-friendly visit logging that takes seconds. Every entry is time-stamped and immediately visible to coordinators and family.",
  },
];

const steps = [
  "Open Client Profile",
  "Read AI Briefing",
  "Execute & Log Visit",
  "Review Family Drafts",
];

export default function AboutPSW() {
  const navigate = useNavigate();

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
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-200 uppercase tracking-widest bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-300" />
            PSW Platform
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5"
          >
            Intelligent Care.{" "}
            <span className="text-blue-200">Seamless Continuity.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-blue-100 text-lg leading-relaxed mb-8 max-w-xl mx-auto"
          >
            CareSync arms every PSW with AI-generated briefings, real-time
            medication monitoring, and adaptive care memory — so you always walk
            in prepared, never blind.
          </motion.p>

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
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
              What We Offer
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Built for how you actually work
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl">
              Every feature is designed around the reality of PSW work — fast,
              mobile-first, and clinically precise.
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
            <p className="text-xs font-semibold text-blue-600 uppercase tracking-widest mb-2">
              Professional Workflow
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
              Your shift, from start to finish
            </h2>
            <p className="text-gray-500 leading-relaxed">
              A streamlined four-step flow that makes every visit consistent,
              documented, and connected — so nothing slips through the cracks.
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
                <span className="w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-gray-800">{step}</span>
                <CheckCircle2 size={16} className="text-blue-200 ml-auto" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-6 bg-blue-600">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Ready to transform your care workflow?
          </h2>
          <p className="text-blue-100 text-base">
            Join hundreds of PSWs who deliver better outcomes with CareSync.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
