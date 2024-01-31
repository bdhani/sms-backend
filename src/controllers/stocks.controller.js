import { Stocks } from "../models/stocks.model.js";
import {StockLog} from "../models/stocklogs.model.js"
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose"
import getRandomIntInclusive from "../utils/randomiser.js";

const addStocks = asyncHandler(async(req, res) => {
    const {companyName, valuation, initialStocks} = req.body

    let addStockResponse = await Stocks.create({
        "companyName" : companyName,
        "valuation": valuation,
        "initialStockPrice" : (valuation/initialStocks),
        "initialStocks" : initialStocks,
        "availableStocks" : initialStocks,
    })

    if(addStockResponse == null) {
        throw new ApiError(500, "Unable to add stock to the database")
    }

    res.status(200).json(
        new ApiResponse(200, addStockResponse, "Added stocks successfully!")
    )
})

const getStocks = asyncHandler(async(req, res) => {
    const {id} = req.query

    if(id == null) {
        throw new ApiError(400, "Stock id is a necessary parameter in request query")
    }

    let getStocksResponse = await Stocks.aggregate([
        {
            $match : {
                "_id" : new mongoose.Types.ObjectId(id)
            }
        },
        {
            $addFields : {
                sellingPrice : {$divide: ["$valuation","$availableStocks"]},    
              }
        }
    ])

    if(getStocksResponse[0] == null) {
        throw new ApiError(404, "Requested stock not found!")
    }

    let logResponse = await StockLog.create({
        "stock" : new mongoose.Types.ObjectId(id),
        "price" : getStocksResponse[0].sellingPrice
    })

    let getStockTimeStamps = await StockLog.aggregate([
        {
            $match : {
                "stock" : new mongoose.Types.ObjectId(id) 
            }
        }
    ])

    getStocksResponse[0].logs = getStockTimeStamps

    res.status(200).json(
        new ApiResponse(200, getStocksResponse[0], "Stock details fetched successfully")
    )
})

const getAllStocks = asyncHandler(async(req, res) => {
    let getStocksResponse = await Stocks.aggregate([
        {
            $addFields : {
                sellingPrice : {$divide: ["$valuation","$availableStocks"]},    
              }
        }
    ])

    if(getStocksResponse == null) {
        throw new ApiError(500, "Unable to fetch stock details")
    }

    res.status(200).json(
        new ApiResponse(200, getStocksResponse, "Stocks fetched successfully")
    )
})

const deleteStock = asyncHandler(async(req, res) => {
    const {id} = req.query

    if(id == null) {
        throw new ApiError(400, "Stock id is a necessary parameter in request query")
    }

    let deleteStockResponse = await Stocks.deleteOne({
        "_id" : id
    })

    if(deleteStockResponse.deletedCount != 1) {
        throw new ApiError(500, "Error while deleting the stock")
    }

    res.status(200).json(
        new ApiResponse(200, deleteStockResponse, "Stocks deleted successfully!")
    )
})

const randomFluctuationStock = asyncHandler(async(req,res) => {
    let {max,min,id,sentiment} = req.body
    let updateParams = {}
    let randomFluctuation = getRandomIntInclusive(min,max)

    if(sentiment === "positive") {
        updateParams = {$mul: {"valuation" : (1+0.01*randomFluctuation)}}
    } else if (sentiment === "negative") {
        updateParams = {$mul : {"valuation" : (1-0.01*randomFluctuation)}}
    } else {
        let random = Math.random()
        if(random > 0.5) {
            updateParams = {$mul: {"valuation" : (1+0.01*randomFluctuation)}}
            sentiment = "positive"
        } else {
            updateParams = {$mul : {"valuation" : (1-0.01*randomFluctuation)}}
            sentiment = "negative"
        }
    }

    let fluctuationReponse = await Stocks.updateOne(
        {"_id" : id}, 
        updateParams
    )

    if(fluctuationReponse == null) {
        throw new ApiError(500, "Error while fluctuating the stock valuation")
    }

    res.status(200).json(
        new ApiResponse(200, {
            "response" : fluctuationReponse,
            "percentChange" : randomFluctuation,
            "sentiment" : sentiment
        }, "Fluctuation done successfully!")
    )
})

const clearStockLogs = asyncHandler(async(req, res) => {
    const {id} = req.query

    let clearStockLogsResponse = await StockLog.deleteMany(
        {"stock" : new mongoose.Types.ObjectId(id)}
    )

    if(clearStockLogsResponse == null || clearStockLogsResponse.deletedCount < 1) {
        throw new ApiError(500, "Error clearing the logs")
    }

    res.status(200).json(
        new ApiResponse(200, clearStockLogsResponse, "Stocks cleared successfully!")
    )
})
export {addStocks, getStocks, getAllStocks, deleteStock, randomFluctuationStock, clearStockLogs}