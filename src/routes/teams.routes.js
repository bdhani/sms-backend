import {Router} from "express"
import { addTeam, deleteTeam, getTeam } from "../controllers/teams.controllers.js"

const router = Router()

router.route("/add").post(addTeam)
router.route("/get").get(getTeam)
router.route("/delete").delete(deleteTeam)

export default router