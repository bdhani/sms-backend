import mongoose, {Schema} from "mongoose"
import { TeamDetails } from "./teams.model.js"

const portfolioDeatilsSchema = new Schema({
    holding: [
        {
            type : Schema.Types.ObjectId,
            ref: "Stock",
            required: true
        }, 
        {
            type : Number,
            required : true
        }
    ],
    TeamDetails : {
        type : Schema.Types.ObjectId,
        ref : "TeamDetail",
        required : true
    }
})

export const Portfolio = mongoose.model("Portfolio", portfolioDeatilsSchema)

