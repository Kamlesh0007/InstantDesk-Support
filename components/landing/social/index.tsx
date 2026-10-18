import React from "react";

const companies = [
  {
    name: "NovaTech",
    className: "text-lg font-bold tracking-tight",
  },
  {
    name: "Sphere",
    className: "text-lg font-bold tracking-tight flex items-center gap-2",
    dot: true,
  },
  {
    name: "VertexAI",
    className: "text-lg font-semibold tracking-tight",
  },
  {
    name: "FlowSync",
    className: "text-lg italic font-serif font-bold",
  },
  {
    name: "HORIZON",
    className: "text-lg font-light tracking-[0.25em]",
  },
];

export default function SocialProof() {
  return (
    <section className="border-y border-white/5 bg-black/20 py-12">
      <div className="mx-auto max-w-6xl px-6 text-center">
        <p className="mb-8 text-xs font-medium uppercase tracking-[0.3em] text-zinc-600">
          Trusted by modern product teams
        </p>

        <div className="group flex flex-wrap justify-center gap-12 md:gap-20">
          {companies.map((company) => (
            <div
              key={company.name}
              className="transition-all duration-300 opacity-40 grayscale hover:opacity-100 hover:grayscale-0 hover:scale-110"
            >
              {company.dot ? (
                <span className={company.className}>
                  <div className="h-4 w-4 rounded-full bg-current" />
                  {company.name}
                </span>
              ) : (
                <span className={company.className}>{company.name}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}