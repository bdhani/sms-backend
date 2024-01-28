import mongoose, {Schema} from "mongoose"


const teamMemberDataSchema = new Schema({
    name : {
        type : String,
        required : true,
        trim : true
    },
    email : {
        type : String,
        required : true,
        trim : true
    },
    phoneNumber: {
        type : String,
        required : true,
        trim : true
    },
    rollNo: {
        type : Number,
        required : true,
    }
}, {
    timestamps : true
})

export const TeamMember = mongoose.model("TeamMember",teamMemberDataSchema)

const teamDetailsSchema = new Schema({
    teamName : {
        type : String,
        required : true,
        trim : true
    }, 
    teamMembers : [
        {
            type : Schema.Types.ObjectId,
            ref: "TeamMember",
            required : true
        }
    ],
    teamId: {
        type: Number,
        required : true
    },
    transactions : [
        {
            type: Schema.Types.ObjectId,
             ref: "Transaction"
        }
    ]
}, {
    timestamps: true
})

export const TeamDetails = mongoose.model("TeamDetails", teamDetailsSchema)