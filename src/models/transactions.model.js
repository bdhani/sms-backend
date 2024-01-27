import mongoose, {Schema} from "mongoose"

const transactionDetailsSchema = new Schema({
    teamId : {
        type: Schema.Types.ObjectId,
        ref : "TeamDetail",
        required : true
    }, 
    timeStamp : {
        type : Schema.Types.Date,
        default : new Date()
    },
    stock : {
        type : Schema.Types.ObjectId,
        ref: "Stock"
    },
    type:  {
        type: String,
        enum: ["buy","sell"],
        required : true
    },
    numberOfStocks : {
        type: Number,
        required: true
    }
})

export const TransactionDetails = mongoose.model("Transaction", transactionDetailsSchema)