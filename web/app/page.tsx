import Hero from "./components/Hero";
import Navbar from "./components/Navbar";
import Services from "./components/Services";
import HowItWorks from "./components/HowItWorks";
import WhyValleyFix from "./components/WhyValleyFix";
import Areas from "./components/ServiceAreas";
import BookingCTA from "./components/BookingCTA";


export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Services />
      <HowItWorks />
      <WhyValleyFix />
      <Areas />
      <BookingCTA />
    </main>
  );
}