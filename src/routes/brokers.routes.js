import { Router } from "express";
import { addBroker, authenticateBroker } from "../controllers/brokers.controller.js";

const router = Router()

router.route("/add").post(addBroker)
router.route("/auth").post(authenticateBroker)

export default router