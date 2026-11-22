import Features from "@/components/landing/features";
import Footer from "@/components/landing/footer";
import Hero from "@/components/landing/hero";
import Integration from "@/components/landing/integration";
import Navbar from "@/components/landing/nav";
import SocialProof from "@/components/landing/social";
import Pricing from "@/components/pricing";
import UnicornBackground from "@/components/landing/unicorn";
const Page = () => {
  return (
    <>
      <UnicornBackground />

      <main className="relative z-10 flex w-full flex-col">
        <Navbar />
        <Hero />
        <SocialProof />
        <Features />
        <Integration />
        <Pricing />
        <Footer />
      </main>
    </>
  );
};

export default Page;