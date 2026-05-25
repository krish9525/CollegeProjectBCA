import React from "react";
import "./testimonials.css";

const testimonialsData = [
  {
    id: 1,
    name: "Rahul Sharma",
    position: "Full Stack Developer",
    rating: 5,
    message:
      "This platform completely transformed my career. The structured courses and expert instructors helped me land my dream job at a top tech company!",
    avatar: "R",
    avatarColor: "#8a4baf",
  },
  {
    id: 2,
    name: "Priya Verma",
    position: "Frontend Engineer",
    rating: 5,
    message:
      "I've tried many online platforms but EduLearn stands out. The interactive content, quizzes, and chat support make learning genuinely fun and effective.",
    avatar: "P",
    avatarColor: "#667eea",
  },
  {
    id: 3,
    name: "Arjun Mehta",
    position: "Data Scientist",
    rating: 5,
    message:
      "The AI/ML courses here are world-class. Learned Python, TensorFlow, and ML concepts step by step. Got promoted within 3 months of completing the course!",
    avatar: "A",
    avatarColor: "#f59e0b",
  },
  {
    id: 4,
    name: "Sneha Patel",
    position: "UI/UX Designer",
    rating: 5,
    message:
      "The design courses are incredibly detailed. From Figma basics to advanced prototyping — everything is covered beautifully. Highly recommend to anyone!",
    avatar: "S",
    avatarColor: "#10b981",
  },
];

const StarRating = ({ count }) => (
  <div className="testimonial-stars">
    {"★".repeat(count)}{"☆".repeat(5 - count)}
  </div>
);

const Testimonials = () => {
  return (
    <section className="testimonials">
      <h2>💬 What Our Students Say</h2>
      <div className="testmonials-cards">
        {testimonialsData.map((t) => (
          <div className="testimonial-card" key={t.id}>
            <div className="student-image">
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "50%",
                  background: `linear-gradient(135deg, ${t.avatarColor}, ${t.avatarColor}bb)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 28,
                  fontWeight: 800,
                  color: "white",
                  marginBottom: 16,
                  boxShadow: `0 4px 16px ${t.avatarColor}44`,
                }}
              >
                {t.avatar}
              </div>
            </div>
            <StarRating count={t.rating} />
            <p className="message">"{t.message}"</p>
            <div className="info">
              <p className="name">{t.name}</p>
              <p className="position">{t.position}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Testimonials;
