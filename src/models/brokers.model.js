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
    }
}, {
    timestamps : true
})

export const Brokers = mongoose.model("Broker", brokerSchema)