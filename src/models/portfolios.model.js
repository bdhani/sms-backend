import mongoose, {Schema} from "mongoose"

const portfolioDeatilsSchema = new Schema({
    currentBalance: {
        type : Schema.Types.Decimal128,
        required: true
    },
    
})