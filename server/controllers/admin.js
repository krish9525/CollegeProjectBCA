import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { Progress } from "../models/Progress.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";

export const createCourse = TryCatch(async (req, res) => {
  const { title, description, category, createdBy, duration, price } = req.body;

  const image = req.file;

  await Courses.create({
    title,
    description,
    category,
    createdBy,
    image: image?.path,
    duration,
    price,
  });

  res.status(201).json({
    message: "Course Created Successfully",
  });
});

// Helper: extract YouTube video ID from any YouTube URL or plain ID
const getYouTubeId = (url) => {
  if (!url) return null;
  // Already just an ID (11 chars, no slashes/dots)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const regex =
    /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const addLectures = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  if (!course)
    return res.status(404).json({
      message: "No Course with this id",
    });

  const { title, description, youtubeUrl } = req.body;

  const videoId = getYouTubeId(youtubeUrl);

  if (!videoId)
    return res.status(400).json({
      message: "Invalid YouTube URL. Please provide a valid YouTube link.",
    });

  const lecture = await Lecture.create({
    title,
    description,
    video: videoId,   // store only the YouTube video ID
    course: course._id,
  });

  res.status(201).json({
    message: "Lecture Added",
    lecture,
  });
});

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  // Video is on YouTube — no local file to delete
  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  // Videos are on YouTube — only delete local course thumbnail image
  rm(course.image, () => {
    console.log("Course thumbnail deleted");
  });

  await Lecture.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCoures = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCoures,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } })
    .select("-password")
    .populate({ path: "subscription", select: "title duration category" });

  res.json({ users });
});

export const updateRole = TryCatch(async (req, res) => {
  if (req.user.role !== "admin" && req.user.mainrole !== "superadmin")
    return res.status(403).json({
      message: "You do not have permission to update roles",
    });

  const user = await User.findById(req.params.id);

  if (!user)
    return res.status(404).json({
      message: "User not found",
    });

  if (user.mainrole === "superadmin")
    return res.status(403).json({
      message: "Cannot change role of superadmin",
    });

  if (req.user._id.toString() === user._id.toString())
    return res.status(400).json({
      message: "You cannot change your own role",
    });

  if (user.role === "user") {
    user.role = "admin";
    await user.save();

    return res.status(200).json({
      message: "Role updated to admin",
    });
  }

  if (user.role === "admin") {
    user.role = "user";
    await user.save();

    return res.status(200).json({
      message: "Role updated to user",
    });
  }

  return res.status(400).json({
    message: "Role cannot be updated",
  });
});

export const revokeCourseAccess = TryCatch(async (req, res) => {
  if (req.user.role !== "admin" && req.user.mainrole !== "superadmin") {
    return res.status(403).json({
      message: "You do not have permission to revoke access",
    });
  }

  const { userId, courseId } = req.params;
  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      message: "User not found",
    });
  }

  if (!user.subscription.includes(courseId)) {
    return res.status(400).json({
      message: "User is not enrolled in this course",
    });
  }

  user.subscription = user.subscription.filter(
    (course) => course.toString() !== courseId
  );
  await user.save();

  const { Progress } = await import("../models/Progress.js");
  await Progress.deleteMany({ user: user._id, course: courseId });

  res.status(200).json({
    message: "Course access revoked successfully",
  });
});
