import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";
import CryptoMarquee from "./CryptoMarquee";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* ✅ TradingView-like moving marquee */}
      <div className="fixed top-0 left-0 right-0 z-[60]">
        <CryptoMarquee />
      </div>

      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-crypto-blue/80 backdrop-blur-md py-3 shadow-lg"
            : "py-6"
        }`}
        style={{
          top: "40px", // ✅ pushing navbar below marquee
        }}
      >
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-white">
              Forex<span className="text-crypto-purple">Trading</span>
            </h1>
          </div>

          {/* Desktop menu */}
          <ul className="hidden lg:flex items-center space-x-8">
            <li>
              <a href="#features" className="text-gray-300 hover:text-white">
                Features
              </a>
            </li>
            <li>
              <a
                href="#how-it-works"
                className="text-gray-300 hover:text-white"
              >
                How it works
              </a>
            </li>
            <li>
              <a
                href="#testimonials"
                className="text-gray-300 hover:text-white"
              >
                Testimonials
              </a>
            </li>
            <li>
              <a href="#pricing" className="text-gray-300 hover:text-white">
                Pricing
              </a>
            </li>
            <li>
              <a href="#faq" className="text-gray-300 hover:text-white">
                FAQ
              </a>
            </li>
          </ul>

          <div className="hidden lg:flex items-center space-x-4">
            <Link to="/login" target="_blank" rel="noopener noreferrer">
              <button className="text-gray-300 bg-crypto-purple hover:bg-crypto-dark-purple py-1 px-3 rounded-lg hover:text-white">
                Login
              </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-crypto-blue/95 backdrop-blur-lg absolute top-full left-0 w-full py-4 shadow-lg">
            <div className="container mx-auto px-4">
              <ul className="flex flex-col space-y-4">
                <li>
                  <a
                    href="#features"
                    className="text-gray-300 hover:text-white block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#how-it-works"
                    className="text-gray-300 hover:text-white block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    How it works
                  </a>
                </li>
                <li>
                  <a
                    href="#testimonials"
                    className="text-gray-300 hover:text-white block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Testimonials
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="text-gray-300 hover:text-white block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Pricing
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="text-gray-300 hover:text-white block py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    FAQ
                  </a>
                </li>
                <li className="pt-4 flex flex-col space-y-3">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <button className="text-gray-300 hover:text-white w-full text-left">
                      Login
                    </button>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;
