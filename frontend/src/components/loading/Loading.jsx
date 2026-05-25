import React from "react";
import "./loading.css";

const Loading = () => {
  return (
    <div className="loading-page">
      <div className="loading-logo">🎓</div>
      <div className="loader"></div>
      <p className="loading-text">Loading EduLearn...</p>
    </div>
  );
};

export default Loading;
