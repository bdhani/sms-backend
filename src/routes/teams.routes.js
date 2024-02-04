import {Router} from "express"
import { addTeam, authenticateTeam, deleteTeam, getAllTeams, getLeaderBoard, getPortfolioDetails, getTeam, getWorth, resetPortfolio, setTeamBalance } from "../controllers/teams.controllers.js"

const router = Router()

router.route("/add").post(addTeam)
router.route("/get").get(getTeam)
router.route("/getAllTeams").get(getAllTeams)
router.route("/delete").delete(deleteTeam)
router.route("/getPortfolioDetails").get(getPortfolioDetails)
router.route("/auth").post(authenticateTeam)
router.route("/setBalance").put(setTeamBalance)
router.route("/resetPortfolio").put(resetPortfolio)
router.route("/getLeaderBoard").get(getLeaderBoard)
router.route("/getWorth").get(getWorth)

export default router