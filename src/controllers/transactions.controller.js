import { Brokers } from "../models/brokers.model.js";
import { Stocks } from "../models/stocks.model.js";
import { TeamDetails } from "../models/teams.model.js";
import { Transactions } from "../models/transactions.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

const performTransaction = asyncHandler(async (req, res) => {
    const { teamId, stockId, numberOfStocks, type, brokerId } = req.body;

    if (brokerId == null) {
        throw new ApiError(400, "BrokerId is a required parameter");
    }

    let findBrokerResponse = await Brokers.findById(brokerId);

    if (findBrokerResponse == null) {
        throw new ApiError(403, "Authentication failed");
    }

    if (teamId == null || stockId == null || numberOfStocks == null || type == null) {
        res.status(400).json(
            new ApiResponse(400, null, "Parameters in body incomplete!")
        );
    }

    let stockDetails = await Stocks.findOne({ "_id": stockId });

    if (stockDetails == null) {
        throw new ApiError(404, "Stock details not found");
    }
    
    let currentTime = new Date()
    let previousTime = currentTime - 300000    //5 minutes
    console.log(new Date(previousTime))

    let lastTransactions = await Transactions.find({"teamId" :teamId, "stocks": stockDetails.companyName, "createdAt" : {$gte : previousTime} }).sort({"createdAt": -1})
    console.log(lastTransactions)

    if(lastTransactions.length >= 3 && teamId != 0) {
        throw new ApiError(420, "Max transactions reached for 5 minutes")   
    }

    // Time restriction: Prevent opposite transaction within 60 seconds
    let timeRestriction = new Date(currentTime.getTime() - 60000); // 60 seconds ago

    let recentTransaction = await Transactions.findOne({
        teamId,
        stocks: stockDetails.companyName,
        createdAt: { $gte: timeRestriction },
    }).sort({ createdAt: -1 });

    if (recentTransaction) {
        // Check for opposite transaction type
        if ((recentTransaction.type === "buy" && type === "sell") || 
            (recentTransaction.type === "sell" && type === "buy")) {
            throw new ApiError(429, "Cannot perform opposite transaction within 60 seconds.");
        }
    }

    let teamDetails = await TeamDetails.findOne({ "teamId": teamId });

    if (teamDetails == null) {
        throw new ApiError(404, "Team not found");
    }

    if(stockDetails.availableStocks <= numberOfStocks  && type === "buy") {
        throw new ApiError(409, "Insufficient stock available to buy")
    }

    // Price manipulation logic - capped change
    let maxPriceChangePercentage = 0.05; // Max 5% change per transaction
    let requestedPrice = (stockDetails.valuation / stockDetails.availableStocks) * numberOfStocks;
    let priceSensitivity=0.02;

    const stockSensitivityMap = {
        "65bc852fa4641538257291c7": 0.02, //pani puri
        "65bc8506a4641538257291c5": 0.0285, //ideation
        "65bc8491a4641538257291c1": 0.042,  //Sudarshan
        "65bc84d6a4641538257291c3": 0.045, //ich
        "677a3e76a44e2f494a1dbad0": 0.052, //nescafe
        "65bc9234a464153825729232": 0.106, //taiyyab
        "677a3d01a44e2f494a1dba16": 0.113, //ccd
    };
    if (stockId in stockSensitivityMap) priceSensitivity = stockSensitivityMap[stockId];

    let valuationChange = 0;

    // Determine if buying or selling and adjust stock price
    if (type === "buy") {
        // Check if the team can afford the transaction
        if (teamDetails.currentBalance < requestedPrice) {
            throw new ApiError(410, "Insufficient team balance");
        }

        // Calculate price change due to demand
        valuationChange = (stockDetails.valuation / stockDetails.availableStocks) * numberOfStocks * priceSensitivity;

        // Cap the price change
        let maxPriceChange = stockDetails.valuation * maxPriceChangePercentage;
        if (Math.abs(valuationChange) > maxPriceChange) {
            valuationChange = Math.sign(valuationChange) * maxPriceChange;
        }

        // Deduct balance and update stock data
        let updateBalanceResponse = await TeamDetails.updateOne(
            { "teamId": teamId },
            { $inc: { "currentBalance": -requestedPrice } }
        );

        let updatePortfolioResponse = await TeamDetails.updateOne(
            { "portfolio.stocks": new mongoose.Types.ObjectId(stockId), "teamId": teamId },
            { $inc: { "portfolio.$.numberOfStocks": numberOfStocks } }
        );

        let updateStockResponse = await Stocks.updateOne(
            { "_id": stockId },
            { $inc: { "availableStocks": -numberOfStocks } }
        );

        let stockManipulationResponse = await Stocks.updateOne(
            {"_id" : stockId},
            {$inc : {"valuation" : valuationChange}}
        );
        let addTransactionResponse = await Transactions.create({
            teamId,
            "stocks" : stockDetails.companyName,
            type,
            numberOfStocks,
            "broker" : findBrokerResponse.username,
            "sellingPrice" : (stockDetails.valuation/stockDetails.availableStocks) 
           })
    
    
           if(updateBalanceResponse == null || updatePortfolioResponse == null || updateStockResponse == null || addTransactionResponse == null || stockManipulationResponse == null) {
            throw new ApiError(500, "Error occured during transaction")
           } else {
            res.status(200).json(
                new ApiResponse(200, {
                    "updateBalance" : updateBalanceResponse,
                    "updatePortfolio" : updatePortfolioResponse,
                    "updateStock" : updateStockResponse,
                    "addTransaction"  : addTransactionResponse,
                    "stockManipulation" : stockManipulationResponse
                }, "Transaction is successful!")
    
            )
           }

    } else if (type === "sell") {
        // Check if the team has enough stocks to sell
        let index = teamDetails.portfolio.find((portfolioDetails) => {
            return String(portfolioDetails.stocks) === stockId
        })
        if(index.numberOfStocks < numberOfStocks || index.numberOfStocks <= 0) {
            throw new ApiError(411, "Insufficient stocks to sell")
        }

        // Calculate price change due to supply
        valuationChange = -(stockDetails.valuation / stockDetails.availableStocks) * numberOfStocks * priceSensitivity;

        // Cap the price change
        let maxPriceChange = stockDetails.valuation * maxPriceChangePercentage;
        if (Math.abs(valuationChange) > maxPriceChange) {
            valuationChange = Math.sign(valuationChange) * maxPriceChange;
        }

        // Update balance and stock data
        let updateBalanceResponse = await TeamDetails.updateOne(
            { "teamId": teamId },
            { $inc: { "currentBalance": requestedPrice } }
        );

        let updatePortfolioResponse = await TeamDetails.updateOne(
            { "portfolio.stocks": new mongoose.Types.ObjectId(stockId), "teamId": teamId },
            { $inc: { "portfolio.$.numberOfStocks": -numberOfStocks } }
        );

        let updateStockResponse = await Stocks.updateOne(
            { "_id": stockId },
            { $inc: { "availableStocks": numberOfStocks } }
        );

        let stockManipulationResponse = await Stocks.updateOne(
            {"_id" : stockId},
            {$inc : {"valuation" : valuationChange}}
        );
        let addTransactionResponse = await Transactions.create({
            teamId,
            "stocks" : stockDetails.companyName,
            type,
            numberOfStocks,
            "broker" : findBrokerResponse.username,
            "sellingPrice" : (stockDetails.valuation/stockDetails.availableStocks)
           })
       
           if(updateBalanceResponse == null || updatePortfolioResponse == null || updateStockResponse == null || addTransactionResponse == null || stockManipulationResponse == null) {
            res.status(500).json(
                new ApiResponse(500, null, "Error occured during the transaction")
            )
           } else {
            res.status(200).json(
                new ApiResponse(200, {
                    "updateBalance" : updateBalanceResponse,
                    "updatePortfolio" : updatePortfolioResponse,
                    "updateStock" : updateStockResponse,
                    "addTransaction"  : addTransactionResponse,
                    "stockManipulation" : stockManipulationResponse
                }, "Transaction is successful!")
       
            )
           }
    }

});

const revertTransactions = asyncHandler(async(req, res)=> {
    const {transactionId} = req.body
    
    let transactionResponse = await Transactions.findById(transactionId)

    if(transactionResponse == null) {
        throw new ApiError(404, "Requested transaction not found!")
    }

    let stockDetails = await Stocks.findOne({
        "companyName" : transactionResponse.stocks
    })

    if(transactionResponse.type === "sell") {
        // console.log(stockDetails)

       let updateBalanceResponse =  await TeamDetails.updateOne(
        {"teamId" : transactionResponse.teamId},
        {
            $inc : {"currentBalance" : -(transactionResponse.sellingPrice * transactionResponse.numberOfStocks)}
       }) 

       let updatePortfolioResponse = await TeamDetails.updateOne(
        {"portfolio.stocks": stockDetails._id, "teamId" : transactionResponse.teamId},
        {$inc: {"portfolio.$.numberOfStocks" : transactionResponse.numberOfStocks}
    })

    // let updateStockReponse = 1
    // let stockManipulationResponse =1

       let updateStockResponse = await Stocks.updateOne(
        {"_id" : stockDetails._id},
        {$inc : {"availableStocks" : -transactionResponse.numberOfStocks}}
       )


       let stockManipulationResponse = await Stocks.updateOne(
        {"_id" : transactionResponse.stockId},
        {$inc : {"valuation" : (transactionResponse.sellingPrice * transactionResponse.numberOfStocks)}}
       )

       let addTransactionResponse = await Transactions.create({
        "teamId" : transactionResponse.teamId,
        "stocks" : stockDetails.companyName,
        "type": "revert",
        "numberOfStocks": transactionResponse.numberOfStocks,
        "broker" : "revert"
       })


       if(updateBalanceResponse == null || updatePortfolioResponse == null || updateStockResponse == null || addTransactionResponse == null || stockManipulationResponse == null) {
        throw new ApiError(500, "Error occured during transaction")
       } else {
        res.status(200).json(
            new ApiResponse(200, {
                "updateBalance" : updateBalanceResponse,
                "updatePortfolio" : updatePortfolioResponse,
                "updateStock" : updateStockResponse,
                "addTransaction"  : addTransactionResponse,
                "stockManipulation" : stockManipulationResponse
            }, "Revert Transaction is successful!")

        )
       }
}

})

export { performTransaction, revertTransactions };
