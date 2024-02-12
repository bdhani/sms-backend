import { Router } from "express";
import { performTransaction, revertTransactions } from "../controllers/transactions.controller.js";

const router = Router()

router.route("/add").post(performTransaction)
router.route("/revert").post(revertTransactions)

export default router