import mongoose from "mongoose"
import { News } from "../models/news.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addNews = asyncHandler(async(req,res) => {
    const {newsText, sentiment, fluctuation, timeOfImpact, stockImpacted} = req.body

    let addNewsResponse = await News.create({
        "newsText" : newsText,
        "sentiment" : sentiment,
        "fluctuation" : fluctuation,
        "timeOfImpact": timeOfImpact,
        "stockImpacted" : stockImpacted
    })

    if(addNewsResponse == null) {
        throw new ApiError(500, "Error while adding news")
    }

    res.status(200).json(
        new ApiResponse(200, addNewsResponse, "Added news successfully!")
    )
})

const getNewsById = asyncHandler(async(req, res)=> {
    const {id} = req.query

    if(id == null) {
        throw new ApiError(400, "Id is a required ")
    }

    const getNewsResponse = await News.findById(id)

    if(getNewsResponse == null) {
        throw new ApiError(404, "News with required id not found")
    }

    res.status(200).json(
        new ApiResponse(200, getNewsResponse, "News details fetched successfully")
    )
})

const getAllNews = asyncHandler(async(req,res) => {
    const getNewsResponse = await News.find()

    if(getNewsResponse == null) {
        throw new ApiError(404, "News with required id not found")
    }

    res.status(200).json(
        new ApiResponse(200, getNewsResponse, "News details fetched successfully")
    )

})

const getNewsByFilters = asyncHandler(async(req, res)=> {
    const {stocks,sentiment} = req.query
    if(stocks == null || sentiment == null) {
        throw new ApiError(400, "Filter parameters are required!")
    }

    let allStockPipeline = [
        {
            $match: {
                "sentiment" : sentiment
            }
        }
    ]

    let allSentimentPipeline = [
        {
            $match: {
               "stockImpacted" : new mongoose.Types.ObjectId(stocks)
            }
        }
    ]

    let allFilterPipeline = [
        {
            $match: {
               "stockImpacted" : new mongoose.Types.ObjectId(stocks),
               "sentiment" : sentiment
            }
        }
    ]

    let allPipeline = [
        {
            $match:{}
        }
    ]

    let getNewsByFiltersResponse;

    if(stocks === "all" && sentiment === "all") {
        getNewsByFiltersResponse = await News.aggregate(allPipeline)
    } else if(stocks == "all") {
        getNewsByFiltersResponse = await News.aggregate(allStockPipeline)
    } else if( sentiment == "all") {
        getNewsByFiltersResponse = await News.aggregate(allSentimentPipeline)
    } else {
        getNewsByFiltersResponse = await News.aggregate(allFilterPipeline)
    }

    res.status(200).json(
        new ApiResponse(200, getNewsByFiltersResponse, "Data fetched successfully")
    )

})

const deleteNews = asyncHandler(async(req,res)=> {
    const {id} = req.query

    if(id == null) {
        throw new ApiError(400, "News id is a necessary parameter in request query")
    }

    let deleteNewsResponse = await News.deleteOne({
        "_id" : id
    })

    if(deleteNewsResponse.deletedCount != 1) {
        throw new ApiError(500, "Error while deleting the stock")
    }

    res.status(200).json(
        new ApiResponse(200, deleteNewsResponse, "Stocks deleted successfully!")
    )
})


export {addNews, getNewsById, getAllNews, getNewsByFilters, deleteNews}