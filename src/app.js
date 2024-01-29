import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()   

app.use(cors({
    origin : process.env.CORS_ORIGIN,
    credentials: true

}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true, limit: "16kb"}))
app.use(express.static("static"))
app.use(cookieParser())

//Routes import
// import quizQuestionRouter from "../src/routes/quizQuestion.routes.js"
// import quizResultRouter from "../src/routes/quizResult.routes.js"
// import quizDetailsRouter from "../src/routes/quizDetails.routes.js"
import teamsRouter from "../src/routes/teams.routes.js"
import stocksRouter from "../src/routes/stocks.routes.js"

//Routes declaration
app.use("/api/v1/teams",teamsRouter)
app.use("/api/v1/stocks", stocksRouter)
// app.use("/api/v1/quizResult", quizResultRouter)
// app.use("/api/v1/quizDetails",quizDetailsRouter)

export {app}