import mongoose, {Schema} from "mongoose"

const stockLogsSchema = new Schema({
    stock : {
        type : Schema.Types.ObjectId,
        ref: "Stock",
        required : true
    },
    price : {
        type : Number,
        required : true
    }
}, {
    timestamps : true
})

export const StockLog = mongoose.model("StockLog", stockLogsSchema)