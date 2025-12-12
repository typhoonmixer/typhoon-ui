import ComplianceSection from "./components/landing-page-sections/ComplianceSection";
import FeaturesSection from "./components/landing-page-sections/FeaturesSection";
import AnonymousAccountsSection from "./components/landing-page-sections/AnonymousAccountsSection";
import Footer from "./components/Footer";
import HeroSection from "./components/landing-page-sections/HeroSection";
import LandingNavbar from "./components/LandingNavbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-300">
      <LandingNavbar />
      <HeroSection />
      <FeaturesSection />
      <AnonymousAccountsSection />
      <ComplianceSection />
      <Footer />
    </div>
  );
}
