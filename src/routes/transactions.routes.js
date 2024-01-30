import { Router } from "express";
import { performTransaction } from "../controllers/transactions.controller.js";

const router = Router()

router.route("/add").post(performTransaction)

export default router