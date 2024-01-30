import mongoose, {Schema} from "mongoose"

const transactionDetailsSchema = new Schema({
    teamId : {
        type: Number,
        required : true
    }, 
    stocks : {
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
}, {
    timestamps: true
})

export const Transactions = mongoose.model("Transaction", transactionDetailsSchema)