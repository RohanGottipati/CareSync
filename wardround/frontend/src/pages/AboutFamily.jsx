import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Heart,
  FileText,
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
  { value: "1,200+", label: "Families Connected" },
  { value: "24/7", label: "Real-Time Monitoring" },
  { value: "98%", label: "Comfort Rating" },
  { value: "100%", label: "Data Security" },
];

const features = [
  {
    icon: <ShieldCheck size={20} className="text-rose-600" />,
    bg: "bg-rose-50",
    title: "Secure Care Memory",
    desc: "Access a persistent, private history of your loved one's care — medications, mood journals, and shift notes. Always there, always yours.",
  },
  {
    icon: <MessageSquare size={20} className="text-indigo-600" />,
    bg: "bg-indigo-50",
    title: "Personalised Updates",
    desc: "Receive updates that matter to you — clinical details or gentle summaries — drafted by AI based on your communication preferences.",
  },
  {
    icon: <Heart size={20} className="text-pink-600" />,
    bg: "bg-pink-50",
    title: "Emotional Wellbeing Tracking",
    desc: "Beyond medications, CareSync captures mood, engagement, and comfort across every visit so you always have the full picture.",
  },
  {
    icon: <FileText size={20} className="text-amber-600" />,
    bg: "bg-amber-50",
    title: "Document Management",
    desc: "Upload care directives, physician notes, and emergency contacts once — instantly accessible to every authorised caregiver.",
  },
];

const steps = [
  "Access Your Family Portal",
  "Monitor Daily Activity",
  "Review Medication Logs",
  "Manage Care Documents",
];

export default function AboutFamily() {
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
            className="inline-flex items-center gap-2 text-xs font-semibold text-rose-200 uppercase tracking-widest bg-white/10 border border-white/20 px-3 py-1.5 rounded-full mb-6"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-300" />
            Family Support Portal
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-5"
          >
            Peace of Mind.{" "}
            <span className="text-rose-200">Redefined.</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            custom={2}
            className="text-blue-100 text-lg leading-relaxed mb-8 max-w-xl mx-auto"
          >
            CareSync connects you to your loved one's care — with real-time
            updates, secure records, and personalised messages that give you
            confidence every single day, no matter the distance.
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
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mb-2">
              What You Get
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Transparent care, every step of the way
            </h2>
            <p className="text-gray-500 mt-3 max-w-xl">
              CareSync keeps families connected to the care that matters most
              — with privacy, clarity, and warmth at every touchpoint.
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

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-20 px-6 bg-gray-50 border-b border-gray-100">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-14 items-start">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            custom={0}
          >
            <p className="text-xs font-semibold text-rose-500 uppercase tracking-widest mb-2">
              Using Your Portal
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mb-4">
              Stay close, from anywhere
            </h2>
            <p className="text-gray-500 leading-relaxed">
              Four simple steps to stay fully informed and at peace, no matter
              how far away you are from your loved one's daily care.
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
                <span className="w-7 h-7 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-sm font-medium text-gray-800">{step}</span>
                <CheckCircle2 size={16} className="text-rose-200 ml-auto" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-20 px-6 bg-rose-500">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
          custom={0}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 tracking-tight">
            Your loved one deserves the best care.
          </h2>
          <p className="text-rose-100 text-base">
            Join over 1,200 families who trust CareSync to keep them informed,
            connected, and at ease.
          </p>
        </motion.div>
      </section>
    </div>
  );
}
