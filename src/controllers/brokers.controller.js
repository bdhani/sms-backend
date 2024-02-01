import { Brokers } from "../models/brokers.model.js";
import { Stocks } from "../models/stocks.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addBroker = asyncHandler(async(req,res)=> {
    const {username, password, stockId, isAll} = req.body

    if(stockId == null) {
        throw new ApiError(400, "Stock id is required")
    }

    let getStockResponse = await Stocks.findById(stockId)

    if(getStockResponse === null) {
        throw new ApiError(404, "No stocks found")
    }

    let addBrokerResponse = await Brokers.create({
        username,
        password,
        stockId,
        isAll
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
        new ApiResponse(200, {
            "brokerId" : authResponse._id,
            "stockId" : authResponse.stockId,
            "isAll" : authResponse.isAll
        }, "Authentication successful")
    )
})

export {addBroker, authenticateBroker}