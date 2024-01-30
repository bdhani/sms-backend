import mongoose, {Schema} from "mongoose"

const stocksDataSchema = new Schema({
    companyName :  {
        type : String,
        required : true,
        trim : true
    },
    valuation : {
        type : Number,
        required : true,
    },
    initialStockPrice : {
        type : Number,
    },
    initialStocks : {
        type : Number,
        required : true,
    },
    availableStocks : {
        type : Number,
    },
}, {
    timestamps: true
})

export const Stocks = mongoose.model("Stock",stocksDataSchema)