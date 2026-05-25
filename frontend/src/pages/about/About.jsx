import React from "react";
import "./about.css";
import { useNavigate } from "react-router-dom";

const cards = [
  { icon: "🎯", title: "Our Mission", desc: "To make quality education accessible to everyone, everywhere — breaking barriers with technology and world-class instructors." },
  { icon: "🌍", title: "Global Reach", desc: "Students from 50+ countries trust EduLearn to build their skills and advance their careers in the digital era." },
  { icon: "🏆", title: "Quality First", desc: "Every course is crafted by industry experts and reviewed regularly to ensure it reflects the latest standards and practices." },
  { icon: "💡", title: "Innovation", desc: "We use interactive content, quizzes, live chat, and AI-powered tools to make learning smarter and more engaging." },
  { icon: "🤝", title: "Community", desc: "Join a thriving community of learners, mentors, and professionals who help each other grow and succeed." },
  { icon: "🚀", title: "Career Growth", desc: "Our courses are designed with real-world outcomes in mind — skills that employers actually want and value." },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="about">
      {/* Hero */}
      <div className="about-hero">
        <span className="about-badge">🎓 About EduLearn</span>
        <h1>
          We're on a mission to
          <span className="about-highlight"> democratize education</span>
        </h1>
        <p>
          EduLearn was founded with a simple belief: everyone deserves access to
          world-class education. We've helped <strong>10,000+</strong> students transform
          their careers with practical, industry-focused learning.
        </p>
        <button className="common-btn about-cta" onClick={() => navigate("/courses")}>
          Explore Our Courses 🚀
        </button>
      </div>

      {/* Cards grid */}
      <div className="about-grid">
        {cards.map((c, i) => (
          <div className="about-card" key={i}>
            <div className="about-card-icon">{c.icon}</div>
            <h3>{c.title}</h3>
            <p>{c.desc}</p>
          </div>
        ))}
      </div>

      {/* Team section */}
      <div className="about-team">
        <h2>Built with ❤️ for learners</h2>
        <p>
          Our team of passionate educators, engineers, and designers work tirelessly
          to create the best learning experience possible. Every feature, every course,
          every interaction is designed with students in mind.
        </p>
      </div>
    </div>
  );
};

export default About;
