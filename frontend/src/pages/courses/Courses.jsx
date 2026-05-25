import React, { useState, useMemo } from "react";
import "./courses.css";
import { CourseData } from "../../context/CourseContext";
import { UserData } from "../../context/UserContext";
import CourseCard from "../../components/coursecard/CourseCard";
import axios from "axios";
import { server } from "../../main";
import toast from "react-hot-toast";

const CATEGORIES = ["All", "Web Development", "App Development", "Data Science",
  "Artificial Intelligence", "Game Development", "UI/UX Design", "Cybersecurity", "DevOps"];

const getCategory = (title = "") => {
  const t = title.toLowerCase();
  if (t.includes("react") || t.includes("vue") || t.includes("angular") || t.includes("web")) return "Web Development";
  if (t.includes("node") || t.includes("express") || t.includes("backend")) return "Web Development";
  if (t.includes("python") || t.includes("ml") || t.includes("data")) return "Data Science";
  if (t.includes("ai") || t.includes("artificial")) return "Artificial Intelligence";
  if (t.includes("flutter") || t.includes("mobile") || t.includes("android") || t.includes("app")) return "App Development";
  if (t.includes("design") || t.includes("ui") || t.includes("ux") || t.includes("figma")) return "UI/UX Design";
  if (t.includes("game") || t.includes("unity")) return "Game Development";
  if (t.includes("security") || t.includes("cyber")) return "Cybersecurity";
  if (t.includes("devops") || t.includes("docker") || t.includes("aws")) return "DevOps";
  return "Web Development";
};

const SORT_OPTIONS = [
  { value: "default",    label: "Default" },
  { value: "price-low",  label: "Price: Low → High" },
  { value: "price-high", label: "Price: High → Low" },
  { value: "title",      label: "A → Z" },
];

const allFormCategories = [
  "Web Development", "App Development", "Game Development",
  "Data Science", "Artificial Intelligence", "UI/UX Design",
  "Cybersecurity", "DevOps",
];

/* ── Add Course Modal for admin ── */
const AddCourseModal = ({ onClose, onSuccess }) => {
  const [title, setTitle]           = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory]     = useState("");
  const [price, setPrice]           = useState("");
  const [createdBy, setCreatedBy]   = useState("");
  const [duration, setDuration]     = useState("");
  const [image, setImage]           = useState(null);
  const [imagePrev, setImagePrev]   = useState("");
  const [loading, setLoading]       = useState(false);

  const handleImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.readAsDataURL(f);
    r.onloadend = () => { setImagePrev(r.result); setImage(f); };
  };

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData();
    fd.append("title", title); fd.append("description", description);
    fd.append("category", category); fd.append("price", price);
    fd.append("createdBy", createdBy); fd.append("duration", duration);
    fd.append("file", image);
    try {
      const { data } = await axios.post(`${server}/api/course/new`, fd, {
        headers: { token: localStorage.getItem("token") },
      });
      toast.success(data.message);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Error creating course");
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="add-course-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>➕ Add New Course</h2>
            <p>Fill in the details to publish a course</p>
          </div>
          <button className="modal-close-btn" onClick={onClose}>✕</button>
        </div>

        <form className="modal-form" onSubmit={submit}>
          <div className="mf-row">
            <div className="mf-field">
              <label>Course Title *</label>
              <input type="text" placeholder="e.g. Complete React Development" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="mf-field">
              <label>Instructor Name *</label>
              <input type="text" placeholder="e.g. Rahul Sharma" value={createdBy} onChange={e => setCreatedBy(e.target.value)} required />
            </div>
          </div>

          <div className="mf-field">
            <label>Description *</label>
            <input type="text" placeholder="Brief course description" value={description} onChange={e => setDescription(e.target.value)} required />
          </div>

          <div className="mf-row">
            <div className="mf-field">
              <label>Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} required>
                <option value="">Select category</option>
                {allFormCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="mf-field">
              <label>Price (₹) *</label>
              <input type="number" placeholder="499" value={price} onChange={e => setPrice(e.target.value)} required min="0" />
            </div>
            <div className="mf-field">
              <label>Duration (weeks) *</label>
              <input type="number" placeholder="8" value={duration} onChange={e => setDuration(e.target.value)} required min="1" />
            </div>
          </div>

          <div className="mf-field">
            <label>Course Thumbnail *</label>
            {imagePrev ? (
              <div className="mf-img-preview-wrap">
                <img src={imagePrev} alt="preview" className="mf-img-preview" />
                <button type="button" className="mf-remove-img" onClick={() => { setImage(null); setImagePrev(""); }}>✕ Remove</button>
              </div>
            ) : (
              <div className="mf-upload-area">
                <input type="file" accept="image/*" onChange={handleImage} required />
                <span>🖼️</span>
                <span>Click to upload thumbnail</span>
              </div>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="modal-cancel-btn" onClick={onClose}>Cancel</button>
            <button type="submit" disabled={loading} className="common-btn modal-submit-btn">
              {loading ? "⏳ Creating..." : "🚀 Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ── Main Courses Page ── */
const Courses = () => {
  const { courses, fetchCourses } = CourseData();
  const { user, isAuth }          = UserData();
  const [search, setSearch]       = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sort, setSort]           = useState("default");
  const [showAddModal, setShowAddModal] = useState(false);
  const isAdmin = isAuth && user?.role === "admin";

  const filtered = useMemo(() => {
    let list = [...(courses || [])];
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(c => c.title?.toLowerCase().includes(q) || c.createdBy?.toLowerCase().includes(q));
    }
    if (activeCategory !== "All") list = list.filter(c => getCategory(c.title) === activeCategory);
    if (sort === "price-low")  list.sort((a, b) => a.price - b.price);
    if (sort === "price-high") list.sort((a, b) => b.price - a.price);
    if (sort === "title")      list.sort((a, b) => a.title?.localeCompare(b.title));
    return list;
  }, [courses, search, activeCategory, sort]);

  return (
    <div className="courses-page">
      {/* Hero */}
      <div className="courses-hero">
        <span className="courses-badge">📚 All Courses</span>
        <h1>Expand Your Knowledge</h1>
        <p>Explore {courses?.length || 0}+ courses by expert instructors</p>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search courses, instructors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="search-clear" onClick={() => setSearch("")}>✕</button>}
        </div>
      </div>

      <div className="courses-body">
        {/* Filters row */}
        <div className="filters-row">
          <div className="category-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`cat-btn ${activeCategory === cat ? "active" : ""}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="sort-wrapper">
            <span className="sort-label">Sort:</span>
            <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>

        {/* Results info + admin add btn */}
        <div className="results-row">
          <span className="results-info">
            {filtered.length > 0
              ? `Showing ${filtered.length} course${filtered.length > 1 ? "s" : ""}${search ? ` for "${search}"` : ""}`
              : ""}
          </span>
          {isAdmin && (
            <button className="admin-add-course-btn" onClick={() => setShowAddModal(true)}>
              ➕ Add Course
            </button>
          )}
        </div>

        {/* Grid */}
        <div className="course-container">
          {filtered.length > 0 ? (
            filtered.map(e => <CourseCard key={e._id} course={e} />)
          ) : (
            <div className="no-courses">
              <div className="no-courses-icon">🔍</div>
              <h3>No courses found</h3>
              <p>Try adjusting your search or filters</p>
              <button className="common-btn" onClick={() => { setSearch(""); setActiveCategory("All"); }}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Add Course Modal */}
      {showAddModal && (
        <AddCourseModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchCourses}
        />
      )}

      {/* FAB for admin */}
      {isAdmin && (
        <button
          className="fab-add-course"
          onClick={() => setShowAddModal(true)}
          title="Add New Course"
        >
          ➕
        </button>
      )}
    </div>
  );
};

export default Courses;
