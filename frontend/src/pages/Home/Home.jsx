import Header from "../../components/Header/Header";
import Hero from "../../components/Hero/Hero";
import Services from "../../components/Services/Services";
import WhyBeeUX from "../../components/WhyBeeUX/WhyBeeUX";
import "./Home.css";
import CaseStudy from "../../components/CaseStudy/CaseStudy";
import Pricing from "../../components/Pricing/Pricing";

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
      </main>
    </>
  );
}

export default Home;
