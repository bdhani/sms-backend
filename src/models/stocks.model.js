import mongoose, {Schema} from "mongoose"

const stocksDataSchema = new Schema({
    companyName :  {
        type : String,
        required : true,
        trim : true
    },
    valuation : {
        type : Number,
    },
    initialStockPrice : {
        type : Number,
    },
    totalStocks : {
        type : Number,
        required : true,
    },
    availableStocks : {
        type : Number,
    },
    isLaunched : {
        type : Boolean,
        default : true
    }
}, {
    timestamps: true
})

export const Stocks = mongoose.model("Stock",stocksDataSchema)