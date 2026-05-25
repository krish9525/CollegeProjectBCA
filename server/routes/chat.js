import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { getChatHistory } from "../controllers/chat.js";

const router = express.Router();

router.get("/:receiverId", isAuth, getChatHistory);

export default router;