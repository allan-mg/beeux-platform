import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import Services from "../../components/Services/Services";
import WhyBeeUX from "../../components/WhyBeeUX/WhyBeeUX";
import "./Home.css";
import CaseStudy from "../../components/CaseStudy/CaseStudy";
import Pricing from "../../components/Pricing/Pricing";
import Process from "../../components/Process/Process";
import Testimonials from "../../components/Testimonials/Testimonials";
import FinalCTA from "../../components/FinalCTA/FinalCTA";
import Footer from "../../components/Footer/Footer";

function Home() {
  return (
    <>
      <Header />

      <main>
        <Hero />
        <Services />
        <WhyBeeUX />
        <CaseStudy />
        <Pricing />
        <Process />
        <Testimonials />
        <FinalCTA />
        <Footer />
      </main>
    </>
  );
}

export default Home;
