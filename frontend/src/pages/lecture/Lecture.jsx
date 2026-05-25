import React, { useEffect, useState } from "react";
import "./lecture.css";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import { TiTick } from "react-icons/ti";

// Extract YouTube video ID from any URL format
const getYouTubeId = (url = "") => {
  if (!url) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

const YouTubePlayer = ({ videoId, onEnded }) => (
  <div className="yt-wrapper">
    <iframe
      key={videoId}
      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white`}
      title="Lecture Video"
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      className="yt-iframe"
      onEnded={onEnded}
    />
  </div>
);

const Lecture = ({ user }) => {
  const [lectures, setLectures] = useState([]);
  const [lecture, setLecture] = useState({});
  const [loading, setLoading] = useState(true);
  const [lecLoading, setLecLoading] = useState(false);
  const [show, setShow] = useState(false);
  const params = useParams();
  const navigate = useNavigate();

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [urlPreviewId, setUrlPreviewId] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  // Progress state
  const [completed, setCompleted] = useState(0);
  const [completedLec, setCompletedLec] = useState(0);
  const [lectLength, setLectLength] = useState(0);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    if (user && user.role !== "admin" && !user.subscription?.includes(params.id)) {
      navigate("/");
    }
  }, [user, navigate, params.id]);

  if (!user) return null;

  const fetchLectures = async () => {
    try {
      const { data } = await axios.get(`${server}/api/lectures/${params.id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setLectures(data.lectures);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const fetchLecture = async (id) => {
    setLecLoading(true);
    try {
      const { data } = await axios.get(`${server}/api/lecture/${id}`, {
        headers: { token: localStorage.getItem("token") },
      });
      setLecture(data.lecture);
    } finally {
      setLecLoading(false);
    }
  };

  const fetchProgress = async () => {
    try {
      const { data } = await axios.get(
        `${server}/api/user/progress?course=${params.id}`,
        { headers: { token: localStorage.getItem("token") } }
      );
      setCompleted(data.courseProgressPercentage);
      setCompletedLec(data.completedLectures);
      setLectLength(data.allLectures);
      setProgress(data.progress);
    } catch (err) {
      console.log(err);
    }
  };

  const addProgress = async (id) => {
    try {
      await axios.post(
        `${server}/api/user/progress?course=${params.id}&lectureId=${id}`,
        {},
        { headers: { token: localStorage.getItem("token") } }
      );
      fetchProgress();
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchLectures();
    fetchProgress();
  }, []);

  // Live preview while admin types URL
  const handleUrlChange = (e) => {
    const val = e.target.value;
    setYoutubeUrl(val);
    const id = getYouTubeId(val);
    setUrlPreviewId(id || "");
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const id = getYouTubeId(youtubeUrl);
    if (!id) {
      toast.error("Invalid YouTube URL! Please paste a valid YouTube link.");
      return;
    }
    setBtnLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/course/${params.id}`,
        { title, description, youtubeUrl },
        { headers: { token: localStorage.getItem("token") } }
      );
      toast.success(data.message);
      setShow(false);
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      setUrlPreviewId("");
      fetchLectures();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setBtnLoading(false);
    }
  };

  const deleteHandler = async (id) => {
    if (confirm("Are you sure you want to delete this lecture?")) {
      try {
        const { data } = await axios.delete(`${server}/api/lecture/${id}`, {
          headers: { token: localStorage.getItem("token") },
        });
        toast.success(data.message);
        fetchLectures();
        setLecture({});
      } catch (error) {
        toast.error(error.response?.data?.message);
      }
    }
  };

  const videoId = lecture.video ? getYouTubeId(lecture.video) : null;

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="lecture-page-wrapper">
          {/* Progress bar top */}
          <div className="progress-bar-section">
            <div className="progress-info">
              <span>📚 Progress: <strong>{completedLec}</strong> / {lectLength} lectures</span>
              <span className="progress-pct">{Math.round(completed)}%</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${completed}%` }}
              />
            </div>
          </div>

          <div className="lecture-page">
            {/* ===== LEFT: Video Player ===== */}
            <div className="left">
              {lecLoading ? (
                <div className="lec-loading">
                  <Loading />
                </div>
              ) : videoId ? (
                <>
                  <YouTubePlayer
                    videoId={videoId}
                    onEnded={() => addProgress(lecture._id)}
                  />
                  <div className="lecture-info">
                    <h1>{lecture.title}</h1>
                    <p>{lecture.description}</p>
                  </div>
                </>
              ) : (
                <div className="no-lecture-selected">
                  <div className="no-lec-icon">▶️</div>
                  <h2>Select a lecture to start watching</h2>
                  <p>Choose any lecture from the list on the right</p>
                </div>
              )}
            </div>

            {/* ===== RIGHT: Sidebar ===== */}
            <div className="right">
              {/* Admin: Add Lecture button */}
              {user?.role === "admin" && (
                <button
                  className="common-btn add-lec-btn"
                  onClick={() => setShow(!show)}
                >
                  {show ? "✕ Close Form" : "+ Add Lecture"}
                </button>
              )}

              {/* Add Lecture Form */}
              {show && (
                <div className="lecture-form">
                  <h2>📹 Add New Lecture</h2>
                  <p className="form-hint">
                    Upload video to YouTube as <strong>Unlisted</strong>, then paste the link below.
                  </p>
                  <form onSubmit={submitHandler}>
                    <label>Lecture Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Introduction to React"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />

                    <label>Description</label>
                    <input
                      type="text"
                      placeholder="Brief description of this lecture"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      required
                    />

                    <label>YouTube Video URL</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={handleUrlChange}
                      required
                    />

                    {/* Live preview */}
                    {urlPreviewId && (
                      <div className="yt-preview">
                        <p className="preview-label">✅ Preview:</p>
                        <YouTubePlayer videoId={urlPreviewId} />
                      </div>
                    )}

                    {youtubeUrl && !urlPreviewId && (
                      <p className="url-error">❌ Invalid YouTube URL</p>
                    )}

                    <button
                      disabled={btnLoading}
                      type="submit"
                      className="common-btn"
                    >
                      {btnLoading ? "Adding..." : "Add Lecture"}
                    </button>
                  </form>
                </div>
              )}

              {/* Lecture List */}
              <div className="lecture-list">
                <h3 className="list-title">
                  📋 Lectures ({lectures.length})
                </h3>
                {lectures && lectures.length > 0 ? (
                  lectures.map((e, i) => {
                    const isCompleted =
                      progress[0]?.completedLectures?.includes(e._id);
                    const isActive = lecture._id === e._id;
                    return (
                      <div key={e._id} className="lecture-item-wrapper">
                        <div
                          onClick={() => fetchLecture(e._id)}
                          className={`lecture-number ${isActive ? "active" : ""} ${isCompleted ? "completed" : ""}`}
                        >
                          <span className="lec-num">{i + 1}</span>
                          <span className="lec-title">{e.title}</span>
                          {isCompleted && (
                            <span className="tick-badge">
                              <TiTick />
                            </span>
                          )}
                        </div>
                        {user?.role === "admin" && (
                          <button
                            className="delete-lec-btn"
                            onClick={() => deleteHandler(e._id)}
                          >
                            🗑
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="no-lec-msg">No lectures added yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Lecture;
