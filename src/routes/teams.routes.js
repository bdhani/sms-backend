import {Router} from "express"
import { addTeam, authenticateTeam, deleteTeam, getAllTeams, getPortfolioDetails, getTeam, resetPortfolio, setTeamBalance } from "../controllers/teams.controllers.js"

const router = Router()

router.route("/add").post(addTeam)
router.route("/get").get(getTeam)
router.route("/getAllTeams").get(getAllTeams)
router.route("/delete").delete(deleteTeam)
router.route("/getPortfolioDetails").get(getPortfolioDetails)
router.route("/auth").post(authenticateTeam)
router.route("/setBalance").put(setTeamBalance)
router.route("/resetPortfolio").put(resetPortfolio)

export default router