import mongoose, {Schema} from "mongoose"

const stocksDataSchema = new Schema({
    companyName :  {
        type : String,
        required : true,
        trim : true
    },
    intialValuation : {
        type : Number,
        required : true,
    },
    initialStockPrice : {
        type : Number,
        required : true,
    },
    initalStocks : {
        type : Number,
        required : true,
    },
    availableStocks : {
        type : Number,
        default : 0
    },
    sellingPrice : {
        type: Number
    }
})

export const StocksSchema = mongoose.model("Stock",stocksDataSchema)