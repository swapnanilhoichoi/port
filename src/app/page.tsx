import About from "@/components/About";
import { Cursors, Loader, Ruler, Sky, TitleTease, TopBar } from "@/components/Chrome";
import Difference from "@/components/Difference";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Process from "@/components/Process";
import Services from "@/components/Services";
import { Cta, DropFun, Faq, Footer } from "@/components/Tail";
import Testimonials from "@/components/Testimonials";
import Work from "@/components/Work";

export default function Home() {
  return (
    <>
      <Loader />
      <Sky />
      <Ruler />
      <TopBar />
      <Cursors />
      <TitleTease />
      <div
        className="grain pointer-events-none fixed inset-0 z-[88] opacity-[0.16] mix-blend-overlay"
        aria-hidden
      />
      <span id="top" />

      <main>
        <Hero />
        <Work />
        <About />
        <Process />
        <Services />
        <Difference />
        <Testimonials />
        <Cta />
        <Pricing />
        <Faq />
        <DropFun />
      </main>

      <Footer />
    </>
  );
}
