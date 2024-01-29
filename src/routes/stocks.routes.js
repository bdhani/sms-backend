import { Router } from "express";
import { addStocks, deleteStock, getAllStocks, getStocks } from "../controllers/stocks.controller.js";

const router = Router()

router.route("/add").post(addStocks)
router.route("/get").get(getStocks)
router.route("/getAllStocks").get(getAllStocks)
router.route("/delete").delete(deleteStock)

export default router