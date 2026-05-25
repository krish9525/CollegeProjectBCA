import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { UserData } from "../../context/UserContext";
import "./home.css";
import Testimonials from "../../components/testimonials/Testimonials";

// Animated counter hook
const useCounter = (target, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return count;
};

const StatCard = ({ icon, value, suffix, label, start }) => {
  const count = useCounter(value, 2000, start);
  return (
    <div className="stat-card">
      <span className="stat-icon">{icon}</span>
      <div className="stat-number">{count.toLocaleString()}{suffix}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
};

const features = [
  { icon: "🎯", title: "Expert Instructors", desc: "Learn from industry professionals with years of experience" },
  { icon: "📱", title: "Learn Anywhere", desc: "Access courses on any device, anytime at your own pace" },
  { icon: "🏆", title: "Certificates", desc: "Earn recognized certificates upon course completion" },
  { icon: "💬", title: "Live Support", desc: "Chat with instructors and get help instantly" },
  { icon: "🎮", title: "Interactive Quizzes", desc: "Test knowledge with fun mini games and quizzes" },
  { icon: "🔄", title: "Lifetime Access", desc: "Once enrolled, access course content forever" },
];

const Home = () => {
  const navigate = useNavigate();
  const { isAuth, user } = UserData();
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setStatsVisible(true); },
      { threshold: 0.3 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="home-page">
      {/* ===== HERO SECTION ===== */}
      <div className="home">
        {/* Floating shapes */}
        <div className="floating-shape shape-1">📚</div>
        <div className="floating-shape shape-2">💡</div>
        <div className="floating-shape shape-3">🚀</div>
        <div className="floating-shape shape-4">⭐</div>

        <div className="home-content">
          <div className="hero-badge">✨ #1 Online Learning Platform</div>
          <h1>
            Unlock Your
            <span className="hero-highlight"> Potential</span>
            <br />
            With Expert Courses
          </h1>

          {isAuth && (
            <div className="home-user-info">
              <span>Welcome back, <strong>{user.name}</strong>! 👋</span>
              <span className={`role-badge role-${user.role || "user"}`}>
                {user.role || "student"}
              </span>
            </div>
          )}

          <p className="hero-sub">
            Join over 10,000+ students already learning on our platform.
            <br />
            Grow your skills, advance your career.
          </p>

          <div className="hero-buttons">
            <button onClick={() => navigate("/courses")} className="common-btn hero-btn-primary">
              🚀 Explore Courses
            </button>
            {isAuth && (
              <button onClick={() => navigate("/game")} className="hero-btn-secondary">
                🎮 Play Quiz Game
              </button>
            )}
            {!isAuth && (
              <button onClick={() => navigate("/register")} className="hero-btn-secondary">
                Register Free →
              </button>
            )}
          </div>

          <div className="hero-trust">
            <div className="trust-avatars">
              {"👩‍💻 👨‍💻 👩‍🎓 👨‍🎓".split(" ").map((a, i) => (
                <span key={i} className="trust-avatar">{a}</span>
              ))}
            </div>
            <span className="trust-text">10,000+ happy learners</span>
          </div>
        </div>
      </div>

      {/* ===== STATS SECTION ===== */}
      <div className="stats-section" ref={statsRef}>
        <StatCard icon="👩‍🎓" value={10000} suffix="+" label="Active Students" start={statsVisible} />
        <StatCard icon="📚" value={50} suffix="+" label="Expert Courses" start={statsVisible} />
        <StatCard icon="🏆" value={5000} suffix="+" label="Certificates Issued" start={statsVisible} />
        <StatCard icon="⭐" value={98} suffix="%" label="Satisfaction Rate" start={statsVisible} />
      </div>

      {/* ===== FEATURES SECTION ===== */}
      <div className="features-section">
        <div className="features-header">
          <span className="section-badge">Why EduLearn?</span>
          <h2>Everything you need to <span className="text-gradient">succeed</span></h2>
          <p>We provide the best learning experience with world-class features</p>
        </div>
        <div className="features-grid">
          {features.map((f, i) => (
            <div className="feature-card" key={i} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CTA BANNER ===== */}
      <div className="cta-banner">
        <div className="cta-content">
          <h2>Ready to start learning? 🎯</h2>
          <p>Join thousands of students transforming their careers today</p>
          <button onClick={() => navigate(isAuth ? "/courses" : "/register")} className="common-btn cta-btn">
            {isAuth ? "Browse All Courses" : "Get Started for Free"}
          </button>
        </div>
      </div>

      {/* ===== TESTIMONIALS ===== */}
      <Testimonials />
    </div>
  );
};

export default Home;
