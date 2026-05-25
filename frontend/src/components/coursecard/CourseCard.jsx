import React from "react";
import "./courseCard.css";
import { server } from "../../main";
import { UserData } from "../../context/UserContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import { CourseData } from "../../context/CourseContext";

// Generate deterministic rating from course title
const getCourseRating = (title = "") => {
  const hash = [...title].reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const ratings = [4.2, 4.5, 4.7, 4.8, 4.3, 4.6, 4.9, 4.4];
  const rating = ratings[hash % ratings.length];
  const count = 50 + (hash % 950);
  return { rating, count };
};

const StarRating = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<span key={i} className="star full">★</span>);
    } else if (i - rating < 1) {
      stars.push(<span key={i} className="star half">★</span>);
    } else {
      stars.push(<span key={i} className="star empty">☆</span>);
    }
  }
  return <div className="stars">{stars}</div>;
};

// Category from course title keyword
const getCategory = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("react") || t.includes("vue") || t.includes("angular")) return { label: "Frontend", color: "#3b82f6" };
  if (t.includes("node") || t.includes("express") || t.includes("backend")) return { label: "Backend", color: "#10b981" };
  if (t.includes("python") || t.includes("ml") || t.includes("ai") || t.includes("data")) return { label: "AI/ML", color: "#f59e0b" };
  if (t.includes("java") || t.includes("spring")) return { label: "Java", color: "#ef4444" };
  if (t.includes("flutter") || t.includes("mobile") || t.includes("android")) return { label: "Mobile", color: "#8b5cf6" };
  if (t.includes("design") || t.includes("ui") || t.includes("ux")) return { label: "Design", color: "#ec4899" };
  if (t.includes("sql") || t.includes("database") || t.includes("mongo")) return { label: "Database", color: "#06b6d4" };
  return { label: "Development", color: "#8a4baf" };
};

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { user, isAuth } = UserData();
  const { fetchCourses } = CourseData();
  const { rating, count } = getCourseRating(course.title);
  const category = getCategory(course.title);
  const isEnrolled = user && user.subscription?.includes(course._id);

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this course?")) {
      try {
        const { data } = await axios.delete(`${server}/api/course/${id}`, {
          headers: { token: localStorage.getItem("token") },
        });
        toast.success(data.message);
        fetchCourses();
      } catch (error) {
        toast.error(error.response.data.message);
      }
    }
  };

  return (
    <div className="course-card">
      {/* Image container */}
      <div className="course-img-wrapper">
        <img src={`${server}/${course.image}`} alt={course.title} className="course-image" />
        <div className="course-overlay">
          <button
            className="overlay-btn"
            onClick={() => navigate(isEnrolled || user?.role === "admin" ? `/course/study/${course._id}` : `/course/${course._id}`)}
          >
            {isEnrolled || user?.role === "admin" ? "▶ Continue" : "👁 Preview"}
          </button>
        </div>
        {/* Category badge */}
        <span className="category-badge" style={{ background: category.color }}>
          {category.label}
        </span>
        {/* Enrolled badge */}
        {isEnrolled && <span className="enrolled-badge">✓ Enrolled</span>}
      </div>

      {/* Card body */}
      <div className="course-body">
        <h3 className="course-title">{course.title}</h3>

        <p className="course-instructor">
          <span className="instructor-icon">👨‍🏫</span>
          {course.createdBy}
        </p>

        {/* Rating */}
        <div className="course-rating">
          <span className="rating-value">{rating}</span>
          <StarRating rating={rating} />
          <span className="rating-count">({count.toLocaleString()})</span>
        </div>

        {/* Meta */}
        <div className="course-meta">
          <span className="meta-item">
            <span>⏱</span> {course.duration} weeks
          </span>
          <span className="meta-item">
            <span>📹</span> Video
          </span>
        </div>

        {/* Price + CTA */}
        <div className="course-footer">
          <div className="course-price">₹{course.price}</div>

          <div className="course-actions">
            {isAuth ? (
              <>
                {user && user.role !== "admin" ? (
                  isEnrolled ? (
                    <button onClick={() => navigate(`/course/study/${course._id}`)} className="card-btn btn-study">
                      Study Now
                    </button>
                  ) : (
                    <button onClick={() => navigate(`/course/${course._id}`)} className="card-btn btn-enroll">
                      Enroll Now
                    </button>
                  )
                ) : (
                  <button onClick={() => navigate(`/course/study/${course._id}`)} className="card-btn btn-study">
                    View Course
                  </button>
                )}
              </>
            ) : (
              <button onClick={() => navigate("/login")} className="card-btn btn-enroll">
                Get Started
              </button>
            )}
          </div>
        </div>

        {/* Admin delete */}
        {user && user.role === "admin" && (
          <button onClick={() => deleteHandler(course._id)} className="card-btn btn-delete">
            🗑 Delete Course
          </button>
        )}
      </div>
    </div>
  );
};

export default CourseCard;
