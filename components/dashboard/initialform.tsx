"use client"; 

import { cn } from "@/lib/utils"; 
import {
    AlertCircle,
  ArrowRight,
  Building2,
  ChevronLeft,
  Command,
  Globe,
  LinkIcon,
  Sparkles,
} from "lucide-react"; 
import React, { useEffect, useRef, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import {
  isValidBusinessName,
  isValidUrl,
  isValidExternalLinks,
} from "@/lib/validators";
import { Alert, AlertDescription } from "../ui/alert";

// Shape of the form data.
interface InitialData {
  businessName: string;
  websiteUrl: string;
  externalLinks: string;
}

// Configuration-driven steps.
// Instead of writing three separate forms, we store the UI configuration
// and render the current step dynamically.
const STEPS = [
  {
    id: "name",
    label: "Business Name",
    question: "What is the name of your business?",
    description: "This will be the identity of your Organization.",
    icon: Building2,
    placeholder: "e.g. Acme Corp",
    type: "text",
    field: "businessName" as keyof InitialData,
  },
  {
    id: "website",
    label: "Website",
    question: "What is your website URL?",
    description: "We will scrape data from here to train your chatbot.",
    icon: Globe,
    placeholder: "https://acme.com",
    type: "url",
    field: "websiteUrl" as keyof InitialData,
  },
  {
    id: "links",
    label: "Extra Context",
    question: "Any other links to add?",
    description:
      "Add external links like Notion pages or Help docs to improve knowledge.",
    icon: LinkIcon,
    placeholder: "https://notion.so/docs...",
    type: "textarea",
    badge: "Optional",
    field: "externalLinks" as keyof InitialData,
  },
];

const InitialForm = () => {
  // Stores the currently visible step.
  const [currentStep, setCurrentStep] = useState(0);

  // Controls fade animation when changing steps.
  const [isAnimating, setIsAnimating] = useState(false);

  // Prevents duplicate submissions and displays loading screen.
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState("");

  // Stores all form values.
  const [formData, setFormData] = useState<InitialData>({
    businessName: "",
    websiteUrl: "",
    externalLinks: "",
  });

  // Reference to the current input so it can automatically receive focus.
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Progress percentage for the top progress bar.
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  // Current step configuration.
  const stepData = STEPS[currentStep];

  // Current icon.
  const Icon = stepData.icon;

  // Focus the input whenever the step changes.
  useEffect(() => {
      setError("");
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 300); // Wait until animation completes.
  }, [currentStep]);

  // Move to next step.
  const handleNext = async () => {
  if (isSubmitting) return;

  setError("");

  switch (currentStep) {
    case 0:
      if (!isValidBusinessName(formData.businessName)) {
        setError(
          "Business name must be between 2 and 100 characters."
        );
        return;
      }
      break;

    case 1:
      if (!isValidUrl(formData.websiteUrl)) {
        setError("Please enter a valid website URL.");
        return;
      }
      break;

    case 2:
      if (!isValidExternalLinks(formData.externalLinks)) {
        setError(
          "One or more external links are invalid."
        );
        return;
      }
      break;
  }

  if (currentStep < STEPS.length - 1) {
    setIsAnimating(true);

    setTimeout(() => {
      setCurrentStep((prev) => prev + 1);
      setIsAnimating(false);
    }, 300);
  } else {
    handleSubmit();
  }
};
  // Move to previous step.
  const handleBack = () => {
    if (currentStep > 0) {
      setIsAnimating(true);

      setTimeout(() => {
        setCurrentStep((prev) => prev - 1);
        setIsAnimating(false);
      }, 300);
    }
  };

  // Keyboard shortcuts.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Textarea supports multiline.
    // Only Ctrl/Cmd + Enter submits.
    if (STEPS[currentStep].type === "textarea") {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleNext();
      }
      return;
    }

    // Normal inputs submit with Enter.
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleNext();
    }
  };

  // Send data to backend.
  const handleSubmit = async () => {
  setError("");
  setIsSubmitting(true);

  try {
    const response = await fetch("/api/metadata/store", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        business_name: formData.businessName,
        website_url: formData.websiteUrl,
        external_links: formData.externalLinks,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "Something went wrong.");
      setIsSubmitting(false);
      return;
    }

    window.location.reload();
  } catch (err) {
    setError("Unable to connect to the server.");
    setIsSubmitting(false);
  }
};

  // Determines if Continue button should be enabled.
  // Third step is optional.
  const isStepValid =
    currentStep >= 2 ||
    (formData[stepData.field] &&
      formData[stepData.field].trim() !== "");

  return (
    <div className="w-full max-w-xl mx-auto min-h-100 flex flex-col justify-center">

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-white/5">
        <div
          className="h-full bg-[#F2A65A] transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Setup Label */}
      <div className="fixed top-6 right-6 md:top-8 md:right-8 text-xs font-medium text-zinc-600 uppercase tracking-widest pointer-events-none fade-in">
        Setup your account
      </div>

      {/* Loading State */}
      {isSubmitting ? (
        <div className="flex flex-col items-center justify-center text-center animate-in fade-in duration-700">

          {/* Animated icon */}
          <div className="relative mb-8">
            <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full animate-pulse" />

            <div className="relative w-16 h-16 bg-linear-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-8 h-8 text-white animate-bounce" />
            </div>
          </div>

          <h2 className="text-2xl font-medium text-white mb-2">
            Storing your organization info!
          </h2>

          <p className="text-zinc-500">
            Scanning {formData.websiteUrl}...
          </p>
        </div>
      ) : (
        <div
          className={cn(
            "transition-all duration-300 ease-in-out transform",
            isAnimating
              ? "opacity-0 translate-y-4 scale-95"
              : "opacity-100 translate-y-0 scale-100"
          )}
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              {currentStep > 0 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleBack}
                  className="text-zinc-500 hover:text-zinc-300 hover:bg-white/5 rounded-full -ml-2 w-8 h-8"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}
           <span className="inline-flex items-center rounded-full border border-[#F2A65A]/30 bg-[#F2A65A]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#F2A65A]">
  Step {currentStep + 1} of {STEPS.length}
</span>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-medium text-white leading-tight">
                {stepData.question}
              </h1>
              <p className="text-lg text-zinc-500 font-light">
                {stepData.description}
              </p>
            </div>

            <div className="relative group">
              {stepData.type === "textarea" ? (
                <Textarea
                  ref={inputRef as any}
                  value={formData[stepData.field] as string}
         onChange={(e) => {
  setError("");

  setFormData({
    ...formData,
    [stepData.field]: e.target.value,
  });
}}
                  onKeyDown={handleKeyDown}
                  placeholder={stepData.placeholder}
className="w-full bg-transparent border-0 border-b border-white/10 text-xl md:text-2xl py-4 pr-12 text-white placeholder:text-zinc-700 focus-visible:ring-0 focus-visible:border-[#F2A65A] rounded-none h-auto shadow-none transition-colors"
                  autoFocus
                />
              ) : (
                <Input
                  ref={inputRef as any}
                  type={stepData.type}
                  value={formData[stepData.field] as string}
              onChange={(e) => {
  setError("");

  setFormData({
    ...formData,
    [stepData.field]: e.target.value,
  });
}}
                  onKeyDown={handleKeyDown}
                  placeholder={stepData.placeholder}
className="w-full bg-transparent border-0 border-b border-white/10 text-xl md:text-2xl py-4 pr-12 text-white placeholder:text-zinc-700 focus-visible:ring-0 focus-visible:border-[#F2A65A] rounded-none h-auto shadow-none transition-colors"
                  autoFocus
                />
              )}

<div className="absolute right-0 top-1/2 -translate-y-1/2 text-zinc-600 group-focus-within:text-[#F2A65A] transition-colors duration-300 pointer-events-none">
  <Icon className="w-6 h-6" />
</div>

            </div>
   {error && (
              <Alert
                variant="destructive"
                className="bg-red-500/10 border-red-500/20 text-red-400 py-2"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="ml-2 text-xs">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <div className="flex items-center justify-between pt-8">
              <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-600">
                {stepData.type === "textarea" ? (
                  <>
                    <Command className="w-3 h-3" />
                    <span>+ Enter</span>
                  </>
                ) : (
                  <span>Press Enter ↵</span>
                )}
                <span className="ml-1">to continue</span>
              </div>

              <Button
                onClick={handleNext}
                disabled={!isStepValid}
                className={cn(
                  "rounded-full px-8 py-6 text-base font-medium transition-all duration-300",
                  !isStepValid
                    ? "bg-zinc-800 text-zinc-500 hover:bg-zinc-800 cursor-not-allowed"
                    : "bg-white text-black hover:bg-zinc-200 hover:shadow-lg hover:shadow-white/10"
                )}
              >
                {currentStep === STEPS.length - 1 ? "Submit" : "Continue"}
                {currentStep === STEPS.length - 1 ? (
                  <Sparkles className="w-4 h-4 ml-2" />
                ) : (
                  <ArrowRight className="w-4 h-4 ml-2" />
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
          
    </div>
  );
};

export default InitialForm;