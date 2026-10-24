import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Advantages from "@/components/Advantages";
import Reviews from "@/components/Reviews";
import Faq from "@/components/Faq";
import LeadForm from "@/components/LeadForm";
import Footer from "@/components/Footer";
import AiAssistant from "@/components/AiAssistant";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Advantages />
        <Reviews />
        <Faq />
        <LeadForm />
      </main>
      <Footer />
      <AiAssistant />
    </>
  );
}
