import { Brokers } from "../models/brokers.model.js";
import { Stocks } from "../models/stocks.model.js";
import { TeamDetails } from "../models/teams.model.js";
import { Transactions } from "../models/transactions.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose"


const performTransaction = asyncHandler(async(req,res)=> {
    const {teamId, stockId, numberOfStocks, type, brokerId} = req.body

    if(brokerId == null) {
        throw new ApiError(400, "BrokerId is a required parameter")
    }

    let findBrokerResponse = await Brokers.findById(brokerId)

    if(findBrokerResponse == null) {
        throw new ApiError(403, "Authentication failed")
    }

    if(teamId == null || stockId == null || numberOfStocks == null || type == null) {
        res.status(400).json(
            new ApiResponse(400, null, "Parameters in body incomplete!")
        )
    }

    let stockDetails = await Stocks.findOne({"_id" : stockId})
    
    if(stockDetails == null) {
        throw new ApiError(404, "Stock details not found")
    }

    let teamDetails = await TeamDetails.findOne({"teamId" : teamId})

    if(teamDetails == null ) {
        throw new ApiError(404, "Team not found")
    }

    if(stockDetails.availableStocks <= numberOfStocks  && type === "buy") {
        throw new ApiError(409, "Insufficient stock available to buy")
    }

    let requestedPrice = (stockDetails.valuation/stockDetails.availableStocks) * numberOfStocks
    
    if(type === "buy" && teamDetails.currentBalance < requestedPrice) {
        throw new ApiError(410, "Insufficient team balance")
    }

    if(type === "sell") {
        let index = teamDetails.portfolio.find((portfolioDetails) => {
            return String(portfolioDetails.stocks) === stockId
        })
        if(index.numberOfStocks < numberOfStocks || index.numberOfStocks <= 0) {
            throw new ApiError(411, "Insufficient stocks to sell")
        }
        
    }
    if(type === "buy") {
        // console.log(stockDetails)
       let updateBalanceResponse =  await TeamDetails.updateOne(
        {"teamId" : teamId},
        {
            $inc : {"currentBalance" : -requestedPrice}
       }) 

       let updatePortfolioResponse = await TeamDetails.updateOne(
        {"portfolio.stocks": new mongoose.Types.ObjectId(stockId), "teamId" : teamId},
        {$inc: {"portfolio.$.numberOfStocks" : numberOfStocks}
    })

       let updateStockReponse = await Stocks.updateOne(
        {"_id" : stockId},
        {$inc : {"availableStocks" : -numberOfStocks}}
       )


       let stockManipulationResponse = await Stocks.updateOne(
        {"_id" : stockId},
        {$inc : {"valuation" : requestedPrice}}
       )

       let addTransactionResponse = await Transactions.create({
        teamId,
        "stocks" : stockDetails.companyName,
        type,
        numberOfStocks,
        "broker" : findBrokerResponse.username
       })

       if(updateBalanceResponse == null || updatePortfolioResponse == null || updateStockReponse == null || addTransactionResponse == null || stockManipulationResponse == null) {
        throw new ApiError(500, "Error occured during transaction")
       } else {
        res.status(200).json(
            new ApiResponse(200, {
                "updateBalance" : updateBalanceResponse,
                "updatePortfolio" : updatePortfolioResponse,
                "updateStock" : updateStockReponse,
                "addTransaction"  : addTransactionResponse,
                "stockManipulation" : stockManipulationResponse
            }, "Transaction is successful!")

        )
       }
}

if(type === "sell") {
    let updateBalanceResponse =  await TeamDetails.updateOne(
     {"teamId" : teamId},
     {
         $inc : {"currentBalance" : requestedPrice}
    }) 

    let updatePortfolioResponse = await TeamDetails.updateOne(
     {"portfolio.stocks": new mongoose.Types.ObjectId(stockId),  "teamId" : teamId},
     {$inc: {"portfolio.$.numberOfStocks" : -numberOfStocks}
 })

    let updateStockReponse = await Stocks.updateOne(
     {"_id" : stockId},
     {$inc : {"availableStocks" : numberOfStocks}}
    )


    let stockManipulationResponse = await Stocks.updateOne(
     {"_id" : stockId},
     {$inc : {"valuation" : -requestedPrice}}
    )

    let addTransactionResponse = await Transactions.create({
     teamId,
     stockId,
     type,
     numberOfStocks,
     "broker" : findBrokerResponse.username
    })

    if(updateBalanceResponse == null || updatePortfolioResponse == null || updateStockReponse == null || addTransactionResponse == null || stockManipulationResponse == null) {
     res.status(500).json(
         new ApiResponse(500, null, "Error occured during the transaction")
     )
    } else {
     res.status(200).json(
         new ApiResponse(200, {
             "updateBalance" : updateBalanceResponse,
             "updatePortfolio" : updatePortfolioResponse,
             "updateStock" : updateStockReponse,
             "addTransaction"  : addTransactionResponse,
             "stockManipulation" : stockManipulationResponse
         }, "Transaction is successful!")

     )
    }
}

})

export {performTransaction}