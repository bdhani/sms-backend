import mongoose, {Schema} from "mongoose"

const transactionDetailsSchema = new Schema({
    teamId : {
        type: Number,
        required : true
    }, 
    stocks : {
        type : String,
        required: true
    },
    type:  {
        type: String,
        enum: ["buy","sell","revert"],
        required : true
    },
    numberOfStocks : {
        type: Number,
        required: true
    },
    broker : {
        type : String,
        required : true
    },
    sellingPrice : {
        type: Number
    }
}, {
    timestamps: true
})

export const Transactions = mongoose.model("Transaction", transactionDetailsSchema)