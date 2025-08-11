import {
  FaRocket,
  FaPaperPlane,
  FaShieldAlt,
  FaCloudUploadAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import RandomPageTransition from './randomPageTrasition';
import ThemeToggle from "./util/ThemeToggle";
import { useNavigate } from "react-router-dom";

// Animation presets
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.2 } },
};

const LandingPage = () => {
  const navigate = useNavigate();

  /** SPA navigation handler */
  const goTo = (path) => navigate(path);

  /** Smooth scroll handler */
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <RandomPageTransition>

      <div className="min-h-screen flex flex-col justify-between font-sans bg-gray-50 text-gray-800 dark:bg-gray-900 dark:text-gray-50 transition-colors duration-500">
        <style>{`
        body { font-family: 'Inter', sans-serif; }
        .bg-gradient-hero {
          background: linear-gradient(135deg, var(--tw-gradient-stops));
        }
      `}</style>

        {/* Navigation Bar */}
        <header className="fixed top-0 left-0 w-full z-50 p-6 md:px-12 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50 backdrop-blur-md transition-colors duration-500">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <FaRocket className="text-white text-xl" />
            </div>
            <span className="text-3xl font-extrabold text-gray-900 dark:text-white">
              Hermes
            </span>
          </div>
          <nav className="space-x-6 flex items-center">
            <button
              onClick={() => scrollToSection("features")}
              className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hidden md:inline-block"
            >
              Features
            </button>
            <button
              onClick={() => scrollToSection("contact")}
              className="text-lg font-medium text-gray-600 dark:text-gray-300 hover:text-blue-500 dark:hover:text-blue-400 transition-colors hidden md:inline-block"
            >
              Contact
            </button>
            <button
              onClick={() => goTo("/signup")}
              className="px-6 py-3 bg-blue-500 dark:bg-blue-400 text-white dark:text-gray-900 rounded-full font-bold text-lg hover:bg-blue-600 dark:hover:bg-blue-300 transition-all shadow-lg transform hover:scale-105 hidden md:inline-block"
            >
              Join Now
            </button>
            <ThemeToggle />
          </nav>
        </header>

        {/* Hero Section */}
        <main className="flex-grow flex items-center justify-center text-center p-6 md:p-12 pt-32 pb-20 bg-gradient-to-br from-blue-100 to-white dark:from-gray-800 dark:to-gray-900 transition-colors duration-500">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl space-y-8 mt-56"
          >
            <motion.h1
              variants={fadeUp}
              className="text-7xl md:text-8xl font-extrabold leading-tight text-gray-900 dark:text-white"
            >
              Connect, Share, and Chat with{" "}
              <span className="text-blue-500 dark:text-blue-400">Hermes</span>
            </motion.h1>
            <motion.p
              variants={fadeUp}
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto"
            >
              A fast, secure, and user-friendly messaging app designed for the way
              you live. Talk with friends, share memories, and organize your
              life—all in one place.
            </motion.p>
            <motion.div
              variants={fadeUp}
              className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-6 pt-4"
            >
              <button
                onClick={() => goTo("/signup")}
                className="w-full md:w-auto px-10 py-4 bg-blue-500 dark:bg-blue-400 text-white dark:text-gray-900 rounded-full font-bold text-lg hover:bg-blue-600 dark:hover:bg-blue-300 transition-all shadow-lg transform hover:scale-105"
              >
                Get Started Today
              </button>
              <button
                onClick={() => scrollToSection("features")}
                className="w-full md:w-auto px-10 py-4 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white rounded-full font-bold text-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all shadow-sm transform hover:scale-105"
              >
                Learn More
              </button>
            </motion.div>
          </motion.div>
        </main>

        {/* Features Section */}
        <section
          id="features"
          className="py-20 px-6 md:px-12 bg-gray-100 dark:bg-gray-800 transition-colors duration-500"
        >
          <h2 className="text-5xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Why You'll Love Hermes
          </h2>
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-12 max-w-6xl mx-auto"
          >
            {[
              {
                icon: <FaPaperPlane size={32} />,
                title: "Instant Messaging",
                text: "Your messages get delivered in real-time, every time. Experience seamless conversations with zero delay.",
                color: "blue",
              },
              {
                icon: <FaShieldAlt size={32} />,
                title: "Built for Privacy",
                text: "We protect your data and conversations so you can chat with peace of mind, knowing your information is safe.",
                color: "purple",
              },
              {
                icon: <FaCloudUploadAlt size={32} />,
                title: "Easy File Sharing",
                text: "Share photos, videos, and documents with a simple tap. Keep your memories and important files organized in one place.",
                color: "pink",
              },
            ].map(({ icon, title, text, color }, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                className={`bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl hover:shadow-2xl flex flex-col items-center text-center transform transition-all duration-300 hover:scale-105 border border-gray-200 dark:border-gray-700`}
              >
                <div
                  className={`h-16 w-16 bg-${color}-500/10 dark:bg-${color}-400/10 text-${color}-500 dark:text-${color}-400 rounded-full flex items-center justify-center mb-4`}
                >
                  {icon}
                </div>
                <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                  {title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">{text}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Footer */}
        <footer
          id="contact"
          className="bg-gray-50 dark:bg-gray-900 p-6 md:p-12 text-center text-gray-500 dark:text-gray-400 transition-colors duration-500"
        >
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="text-xl font-bold text-gray-800 dark:text-white">
              Hermes
            </div>
            <p>A modern chat application designed for everyone.</p>
            <div className="flex justify-center space-x-6">
              <a
                href="#"
                className="hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Privacy Policy
              </a>
              <a
                href="#"
                className="hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="https://opensource.org/licenses/MIT"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-gray-800 dark:hover:text-white transition-colors"
              >
                MIT License
              </a>
            </div>
            <p>© 2025 Hermes. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </RandomPageTransition>
  );
};

export default LandingPage;
