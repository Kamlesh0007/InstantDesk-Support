import Features from '@/components/landing/features'
import Footer from '@/components/landing/footer'
import Hero from '@/components/landing/hero'
import Integration from '@/components/landing/integration'
import Navbar from '@/components/landing/nav'
import SocialProof from '@/components/landing/social'
import Pricing from '@/components/pricing'
import React from 'react'

const Page = () => {
  return (
 <main className="w-full flex flex-col relative z-10">
      <Navbar />
     <Hero/>
     <SocialProof/>
     <Features/>
     <Integration/>
     <Pricing/>
     <Footer/>
    </main>
  )
}

export default Page