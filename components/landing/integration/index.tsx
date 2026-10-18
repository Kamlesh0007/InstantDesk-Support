import React from "react";

const Integration = () => {
  return (
    <section
      id="how-it-works"
      className="py-24 border-t border-white/5 bg-black/20"
    >
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center gap-16">
        <div className="flex-1">
          <h2 className="text-3xl md:text-4xl font-medium text-white tracking-tight mb-6">
            Three steps, no backend work.
          </h2>
          <p className="text-lg text-zinc-400 font-light mb-8 leading-relaxed">
            You don&apos;t write a knowledge base twice. InstantDesk parses
            what you already have and serves it through a widget that reads
            your page&apos;s CSS variables, so it matches your site without
            custom styling.
          </p>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 text-sm text-zinc-300 font-light">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">
                1
              </div>
              Scan your documentation URL
            </div>
            <div className="w-px h-4 bg-zinc-800 ml-3"></div>
            <div className="flex items-center gap-4 text-sm text-zinc-300 font-light">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">
                2
              </div>
              Copy the embed snippet
            </div>
            <div className="w-px h-4 bg-zinc-800 ml-3"></div>
            <div className="flex items-center gap-4 text-sm text-zinc-300 font-light">
              <div className="w-6 h-6 rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-[10px] text-zinc-500">
                3
              </div>
              Auto-resolve tickets
            </div>
          </div>
        </div>


        <div className="flex-1 w-full max-w-lg">
          <div className="rounded-xl p-6 relative bg-white/[0.03] backdrop-blur-md border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
              </div>
              <span className="text-xs text-zinc-600 font-mono">
                index.html
              </span>
            </div>
            <div className="font-mono text-xs md:text-sm leading-7 text-zinc-400">
              <div className="text-zinc-600">&lt;!-- InstantDesk --&gt;</div>
              <div>
                &lt;<span className="text-pink-400">script</span>
              </div>
              <div className="pl-4">
                <span className="text-indigo-400">src</span>=
                <span className="text-emerald-400">
                  &quot;https://instandesk.dev/widget.js&quot;
                </span>
              </div>
              <div className="pl-4">
                <span className="text-indigo-400">data-id</span>=
                <span className="text-emerald-400">
                  &quot;8f2c1e4a-9b3d-4a71-9e02-7c1f5a2b6d90&quot;
                </span>
                <br />
                <span className="text-indigo-400">defer&gt;</span>
              </div>
              <div>
                &lt;/<span className="text-pink-400">script</span>&gt;
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Integration;