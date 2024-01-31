import mongoose, {Schema} from "mongoose"

const newsDetailsSchema = new Schema({
    newsText: {
        type : String,
        required : true,
        trim : true
    },
    newsMedia : {
        type : String,
        trim : true
    },
    sentiment : {
        type : String,
        enum : ["positive","negative", "neutral"],
        default : "neutral",
        required : true
    },
    fluctuation : {
        type : Number,
        required: true
    },
    timeOfImpact : {
        type : Number,
    },
    stockImpacted: {
        type : Schema.Types.ObjectId,
        ref: "Stock",
        required : true
    },
    isDisplayed : {
        type : Boolean,
        default : false
    }
}, {
    timestamps : true
})

export const News = mongoose.model("NewsDetail", newsDetailsSchema)