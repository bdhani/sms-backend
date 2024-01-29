import { Router } from "express";
import { addNews, deleteNews, getAllNews, getNewsByFilters, getNewsById } from "../controllers/news.controller.js";

const router = Router()

router.route("/add").post(addNews)
router.route("/get").get(getNewsById)
router.route("/getAllNews").get(getAllNews)
router.route("/getNewsByFilter").get(getNewsByFilters)
router.route("/delete").delete(deleteNews)

export default router