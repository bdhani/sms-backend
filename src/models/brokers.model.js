import mongoose, {Schema} from "mongoose"

const brokerSchema = new Schema({
    username : {
        type : String,
        required: true,
        trim : true
    }, 
    password: {
        type : String,
        required: true,
        trim : true
    },
    stockId : {
        type : Schema.Types.ObjectId,
        ref : "Stock",
        required : true
    },
    isAll : {
        type : Boolean,
        default : false
    }
}, {
    timestamps : true
})

export const Brokers = mongoose.model("Broker", brokerSchema)