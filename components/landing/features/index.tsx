import { BookOpen, MessageCircleHeart, ShieldCheck } from "lucide-react";
import React from "react";

const FEATURES = [
  {
    n: "01",
    icon: BookOpen,
    title: "Reads what you've already written",
    body: "Point it at your site or docs and it builds a working understanding of your product on its own — no manual training passes, no data labeling.",
  },
  {
    n: "02",
    icon: ShieldCheck,
    title: "Stays inside the lines",
    body: "Set the boundaries once. Outside them, it says so plainly instead of guessing at an answer it isn't sure of.",
  },
  {
    n: "03",
    icon: MessageCircleHeart,
    title: "Sounds like your team, not a script",
    body: "Formal, casual, or blunt — it picks up tone from the content you've already written, so replies never feel canned.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-32 px-6 max-w-6xl mx-auto">
      <div className="mb-20 max-w-xl">
        <h2 className="text-3xl md:text-5xl font-medium text-white tracking-tight mb-6">
          Designed for trust.
        </h2>
        <p className="text-xl text-zinc-500 font-light leading-relaxed">
          Most AI support tools guess when they don&apos;t know. Instandesk
          stays grounded in what you&apos;ve actually written.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/5 rounded-3xl overflow-hidden border border-white/5">
        {FEATURES.map(({ n, icon: Icon, title, body }) => (
          <div
            key={n}
            className="group relative bg-[#050509] p-8 md:p-10 hover:bg-white/[0.02] transition-colors"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-[#F2A65A]/0 via-[#F2A65A]/0 to-[#F2A65A]/0 group-hover:from-[#F2A65A]/80 group-hover:via-[#F2A65A]/10 group-hover:to-[#F2A65A]/0 transition-all duration-500" />

            <div className="flex items-center justify-between mb-8">
              <span className="text-xs font-mono text-zinc-600 tracking-widest">
                {n}
              </span>
              <Icon className="w-5 h-5 text-[#F2A65A]/70 group-hover:text-[#F2A65A] transition-colors" />
            </div>

            <h3 className="text-lg font-medium text-white mb-3 tracking-tight">
              {title}
            </h3>
            <p className="text-sm text-zinc-400 font-light leading-relaxed">
              {body}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Features;