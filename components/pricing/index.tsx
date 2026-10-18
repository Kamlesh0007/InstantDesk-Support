import { Check } from "lucide-react";
import React from "react";

const plans = [
  {
    name: "Starter",
    price: "$0",
    description: "Perfect for individuals exploring AI-powered support.",
    button: "Start Free",
    highlighted: false,
    features: [
      "100 AI conversations / month",
      "1 Knowledge Base",
      "AI-powered customer replies",
      "Basic analytics",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$49",
    description: "Everything you need to automate customer support at scale.",
    button: "Start 14-Day Trial",
    highlighted: true,
    features: [
      "Unlimited AI conversations",
      "Unlimited Knowledge Bases",
      "Custom AI personality",
      "Advanced analytics",
      "Remove InstantDesk branding",
      "API & Webhook access",
      "Priority email & live chat support",
    ],
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For growing businesses with advanced security and support needs.",
    button: "Contact Sales",
    highlighted: false,
    features: [
      "Unlimited everything",
      "Dedicated AI model",
      "SSO & Role-based access",
      "Custom integrations",
      "Dedicated account manager",
      "99.9% SLA",
      "Priority onboarding",
    ],
  },
];

export default function Pricing() {
  return (
    <section
      id="pricing"
      className="py-28 px-6 max-w-7xl mx-auto text-center"
    >
      <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-1 text-xs font-medium text-primary">
        Pricing
      </span>

      <h2 className="mt-6 text-4xl md:text-5xl font-semibold tracking-tight text-white">
        Simple pricing that grows with your business.
      </h2>

      <p className="mt-4 max-w-2xl mx-auto text-lg text-zinc-400">
        Start free and upgrade only when your support volume grows. No hidden
        fees. Cancel anytime.
      </p>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`relative flex flex-col rounded-3xl border transition-all duration-300 hover:-translate-y-2 ${
              plan.highlighted
                ? "border-[#F2A65A]/30 bg-white/5 shadow-2xl shadow-primary/10"
                : "border-white/10 bg-white/2 hover:border-white/20"
            }`}
          >
            {plan.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-primary px-4 py-1 text-xs font-semibold text-[#F2A65A]">
                Most Popular
              </div>
            )}

            <div className="p-8 text-left flex-1 flex flex-col">
              <h3
                className={`text-lg font-semibold ${
                  plan.highlighted ? "text-[#F2A65A]" : "text-white"
                }`}
              >
                {plan.name}
              </h3>

              <p className="mt-3 text-sm text-zinc-500 leading-relaxed">
                {plan.description}
              </p>

              <div className="mt-8">
                <span className="text-5xl font-bold tracking-tight text-white">
                  {plan.price}
                </span>

                {plan.price !== "Custom" && (
                  <span className="ml-2 text-zinc-500">/month</span>
                )}
              </div>

              <div className="my-8 h-px bg-white/10" />

              <ul className="space-y-4 flex-1">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm text-zinc-300"
                  >
                    <div
                      className={`mt-0.5 flex h-5 w-5 items-center justify-center rounded-full ${
                        plan.highlighted
                          ? "bg-[#F2A65A]/15"
                          : "bg-white/5"
                      }`}
                    >
                      <Check
                        className={`h-3.5 w-3.5 ${
                          plan.highlighted
                            ? "text-[#F2A65A]"
                            : "text-zinc-400"
                        }`}
                      />
                    </div>

                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`mt-10 h-12 rounded-xl text-sm font-medium transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-[#F2A65A] text-black hover:brightness-110"
                    : "border border-white/10 bg-white/5 text-white hover:bg-white/10"
                }`}
              >
                {plan.button}
              </button>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-10 text-sm text-zinc-500">
        ✓ No credit card required &nbsp; • &nbsp; ✓ Cancel anytime &nbsp; •
        &nbsp; ✓ Free migration assistance
      </p>
    </section>
  );
}