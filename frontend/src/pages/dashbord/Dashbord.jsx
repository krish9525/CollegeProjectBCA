import React from "react";
import "./dashbord.css";
import { CourseData } from "../../context/CourseContext";
import CourseCard from "../../components/coursecard/CourseCard";
import { useNavigate } from "react-router-dom";

const Dashbord = () => {
  const { mycourse } = CourseData();
  const navigate = useNavigate();

  return (
    <div className="student-dashboard">
      <h2>📚 My Enrolled Courses</h2>
      <p className="dashboard-subtitle">
        Continue learning where you left off
      </p>

      <div className="dashboard-content">
        {mycourse && mycourse.length > 0 ? (
          mycourse.map((e) => <CourseCard key={e._id} course={e} />)
        ) : (
          <div className="empty-dashboard">
            <span>🎓</span>
            <p>You haven't enrolled in any course yet!</p>
            <button className="common-btn" style={{ marginTop: 20 }} onClick={() => navigate("/courses")}>
              Browse Courses
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashbord;
