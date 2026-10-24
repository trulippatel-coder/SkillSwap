import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import HowItWorks from "../components/HowItWorks";
import PopularSkills from "../components/PopularSkills";
import CTA from "../components/CTA";
import Footer from "../components/Footer";

function Home() {
    return (
        <>
            <Navbar />

            <main>
                <Hero />
                <HowItWorks />
                <PopularSkills />
                <CTA />
            </main>

            <Footer />
        </>
    );
}

export default Home;