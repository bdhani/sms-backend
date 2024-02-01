import { Router } from "express";
import { addAdditionalStocks, addStocks, clearStockLogs, deleteStock, getAllStocks, getStocks, randomFluctuationStock } from "../controllers/stocks.controller.js";

const router = Router()

router.route("/add").post(addStocks)
router.route("/get").get(getStocks)
router.route("/getAllStocks").get(getAllStocks)
router.route("/delete").delete(deleteStock)
router.route("/fluctuate").post(randomFluctuationStock)
router.route("/clearLogs").delete(clearStockLogs)
router.route("/addAdditionalStocks").post(addAdditionalStocks)

export default router