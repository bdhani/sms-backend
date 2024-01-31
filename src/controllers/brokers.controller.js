import { Brokers } from "../models/brokers.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addBroker = asyncHandler(async(req,res)=> {
    const {username, password} = req.body

    let addBrokerResponse = await Brokers.create({
        username,
        password
    })

    if(addBrokerResponse == null) {
        throw new ApiError(500, "Error while adding a broker")
    }

    res.status(200).json(
        new ApiResponse(200, addBrokerResponse, "Added broker successfully")
    )
})

const authenticateBroker = asyncHandler(async(req,res) => {
    const {username, password} = req.body

    let authResponse = await Brokers.findOne(
        {
            "username" : username,
            "password" : password
        }
    )

    if(authResponse == null) {
        throw new ApiError(403, "Authentication failed!")
    }

    res.status(200).json(
        new ApiResponse(200, authResponse._id, "Authentication successful")
    )
})

export {addBroker, authenticateBroker}