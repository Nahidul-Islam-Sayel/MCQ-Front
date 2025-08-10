import React, { useEffect, useState } from "react";
import { FaCertificate, FaGraduationCap, FaShieldAlt } from "react-icons/fa";
import img1 from "../src/assets/HomePage/HeroImage.jpg";

const primaryColor = "#122048";

const AnimatedCount: React.FC<{
  target: number | string;
  duration?: number;
}> = ({ target, duration = 1500 }) => {
  const [count, setCount] = useState(0);
  const isNumber = typeof target === "number";

  useEffect(() => {
    if (!isNumber) {
      setCount(0);
      return;
    }
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = timestamp - startTimestamp;
      const progressRatio = Math.min(progress / duration, 1);
      setCount(Math.floor(progressRatio * (target as number)));
      if (progress < duration) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
    return () => setCount(0);
  }, [target, duration, isNumber]);

  return <>{isNumber ? count.toLocaleString() : target}</>;
};

const Home: React.FC = () => {
  return (
    <div className="font-sans text-gray-800">
      {/* Hero Section */}
      <section
        className="relative bg-cover bg-center min-h-[70vh] md:min-h-[80vh] flex items-center justify-center"
        style={{ backgroundImage: `url(${img1})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/40" />
        <div className="relative p-4 sm:p-6 md:p-10 text-center text-white max-w-3xl">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight drop-shadow-lg">
            Test Your Programming Skills with Confidence
          </h1>
          <p className="text-base sm:text-lg md:text-xl opacity-90">
            Structured assessment flow. Real-time compiler. Instant
            certification.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-20 bg-white">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-10 sm:mb-12 md:mb-14"
          style={{ color: primaryColor }}
        >
          Why Test on Pro Coder Hero?
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 max-w-6xl mx-auto">
          {[
            {
              title: "3-Step Assessment Flow",
              desc: "Progress through A, B, and C levels with score-based certification logic.",
              icon: <FaGraduationCap className="text-4xl mb-6 mx-auto" />,
            },
            {
              title: "Real-Time Coding Tests",
              desc: "Built-in compiler to run and validate your code immediately.",
              icon: <FaShieldAlt className="text-4xl mb-6 mx-auto" />,
            },
            {
              title: "Instant Digital Certification",
              desc: "Receive verified digital certificates based on your test performance.",
              icon: <FaCertificate className="text-4xl mb-6 mx-auto" />,
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-[#f9fafe] p-6 sm:p-8 md:p-10 rounded-3xl shadow-md transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl border-2"
              style={{ borderColor: primaryColor }}
            >
              <div className="text-center" style={{ color: primaryColor }}>
                {card.icon}
              </div>
              <h3
                className="text-xl sm:text-2xl font-semibold mb-4 text-center"
                style={{ color: primaryColor }}
              >
                {card.title}
              </h3>
              <p className="text-gray-700 text-center text-sm sm:text-base">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Certification Steps */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-20 bg-[#f0f4ff]">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-10 sm:mb-12 md:mb-14"
          style={{ color: primaryColor }}
        >
          3-Step Certification Process
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {[
            {
              step: "Step 1",
              levels: "Levels A1 & A2",
              desc: `Score <25% → Fail (no retake)
25–49.99% → A1 Certified
50–74.99% → A2 Certified
≥75% → A2 Certified + Proceed to Step 2`,
            },
            {
              step: "Step 2",
              levels: "Levels B1 & B2",
              desc: `<25% → Remain at A2
25–49.99% → B1 Certified
50–74.99% → B2 Certified
≥75% → B2 Certified + Proceed to Step 3`,
            },
            {
              step: "Step 3",
              levels: "Levels C1 & C2",
              desc: `<25% → Remain at B2
25–49.99% → C1 Certified
≥50% → C2 Certified`,
            },
          ].map((item, i) => (
            <div
              key={i}
              className="bg-white p-6 sm:p-8 md:p-10 rounded-3xl shadow-lg border-l-8 whitespace-pre-line text-sm sm:text-base"
              style={{ borderColor: primaryColor }}
            >
              <h3
                className="text-xl sm:text-2xl font-bold mb-3"
                style={{ color: primaryColor }}
              >
                {item.step} – {item.levels}
              </h3>
              <p className="text-gray-700">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Statistics */}
      <section className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-20 bg-white">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center mb-10 sm:mb-12 md:mb-14"
          style={{ color: primaryColor }}
        >
          Pro Coder Hero in Numbers
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10 max-w-6xl mx-auto text-center">
          {[
            { num: "20K+", label: "Assessments Completed" },
            { num: "10K+", label: "Certified Programmers" },
            { num: 3, label: "Certification Levels" },
            { num: "100%", label: "Real-Time Compiler Accuracy" },
          ].map((stat, i) => (
            <div
              key={i}
              className="bg-[#f9fafe] p-6 sm:p-8 md:p-10 rounded-3xl shadow-md border-2"
              style={{ borderColor: primaryColor }}
            >
              <h3
                className="text-3xl sm:text-4xl font-extrabold mb-3"
                style={{ color: primaryColor }}
              >
                <AnimatedCount target={stat.num} />
              </h3>
              <p className="text-gray-700 text-sm sm:text-base">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
