import { TeamDetails, TeamMember } from "../models/teams.model.js";
import { Stocks } from "../models/stocks.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose, { Schema } from "mongoose"

const addTeam = asyncHandler(async(req,res)=> {
    const {teamDetails, teamName, teamId, username, password} = req.body
    // let id = parseInt(teamId)

    if(username == null && password == null) {
        throw new ApiError(400, "Username and password are required")
    }

    let updateTeamIdResponse = await TeamDetails.findOneAndUpdate(
        {_id : "65bde9cc30a827f80d7c8a82"},
        {$inc: {"teamIdCount" : 1}} 
    )

    let teamMembers = await TeamMember.insertMany(teamDetails)

    if(teamDetails == null) {
        throw new ApiError(500, "Error while inserting the team members")
    }

    let stockDetails = await Stocks.find()
    // console.log(stockDetails)

    let portfolio = []

    stockDetails.forEach((stock) => {
        // console.log(stock._id)
        let data = {
            "stocks" : stock._id,
            "numberOfStocks": 0,
        }
        // console.log(data)
        portfolio.push(data)
    })


    let team = await TeamDetails.create({
        teamName,
        teamMembers,
        teamId : updateTeamIdResponse.teamIdCount,
        portfolio : portfolio,
        username : username,
        password : password
    })

    if(team == null) {
        throw new ApiError(500, "Error while adding the team")
    }

    res.status(200).json(
        new ApiResponse(200, team, "Teams added successfully")
    )
})

const getTeam = asyncHandler(async(req, res) => {

    const {id} = req.query

    if(id == null ) {
        throw new ApiError(400, "Id field is required as a query params")
    }

    let teamId = parseInt(id)

    let team = await TeamDetails.aggregate([
        {
            $match: {
                "teamId" : teamId
            }
        },
        {
            $lookup: {
                from: "teammembers",
                localField: "teamMembers",
                foreignField: "_id",
                as: "members"
            }
        },
        {
            $project: {
                "teamMembers"  : 0,
                "portfolio" : 0,
                "transactions" : 0,
                "username" : 0,
                "password" : 0
            }
        }
    ])

    if(team.length == 0) {
        throw new ApiError(404, "Searched team not found")
    }

    console.log(team)

    res.status(200).json(
        new ApiResponse(200, team[0], "Team details fetched successfully!")
    )
})

const getAllTeams = asyncHandler(async(req, res) => {
    let team = await TeamDetails.aggregate([
        {
            $lookup: {
                from: "teammembers",
                localField: "teamMembers",
                foreignField: "_id",
                as: "members"
            }
        },
        {
            $project: {
                "teamMembers"  : 0,
                "portfolio" : 0,
                "transactions" : 0,
                "username" : 0,
                "password" : 0
            }
        }
    ])

    if(team == null) {
        throw new ApiError(500, "Unable to fetch details")
    }

    res.status(200).json(
        new ApiResponse(200, team, "Team details fetched successfully")
    )
})

const deleteTeam = asyncHandler(async(req, res) => {

    const {id} = req.query

    if(id == null ) {
        throw new ApiError(400, "Id field is required as a query params")
    }

    let getTeam = await TeamDetails.findOne({
        teamId: parseInt(id)
    })

    let deleteMembers = await TeamMember.deleteMany({"_id" : getTeam.teamMembers})
    // console.log(deleteMembers.deletedCount)

    let deleteResponse = await TeamDetails.deleteOne({
        teamId: parseInt(id)
    })

    if(deleteResponse.deletedCount != 1) {
        throw new ApiError(500, "Error while deleting the team")
    }

    res.status(200).json(
        new ApiResponse(200, deleteMembers, "Requested team deleted successfully!")
    )
})

const getPortfolioDetails = asyncHandler(async(req,res)=>{

    const {id} = req.query
    
    if(id == null ) {
        throw new ApiError(400, "Id field is required as a query params")
    }

    let portfolioResponse = await TeamDetails.aggregate([
        {
          $match : {
            "_id" : new mongoose.Types.ObjectId(id),
          }  
        },
        {
            $lookup: {
                from: "stocks",
                localField : "portfolio.stocks",
                foreignField: "_id",
                as: "stockDetails"
            }
        },
        {
            $project :{
                "username" : 0,
                "password" : 0,
                "transactions" : 0,
            }
        }
    ])

    if(portfolioResponse == null) {
        throw new ApiError(500, "Error while fetching portfolio details")
    }

    if(portfolioResponse.length == 0) {
        res.status(404).json(
            new ApiResponse(404, null, "No such team found")
        )
    }

    res.status(200).json(
        new ApiResponse(200, portfolioResponse[0], "Portfolio details fetched successfully")
    )

})

const authenticateTeam = asyncHandler(async(req,res) => {
    const {username, password} = req.body

    if(username == null || password == null) {
        throw new ApiError(400, "Username and password are required fields")
    }

    let authResponse = await TeamDetails.findOne(
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

const setTeamBalance = asyncHandler(async(req,res) => {
    const {value} = req.query
    let teamBalance = parseFloat(value)

    if(!value) {
        throw new ApiError(400, "Value is required in query param")
    }

    let response = await TeamDetails.updateMany(
        {},
        {$set : {"currentBalance" : teamBalance}}
    )

    if(!response) {
        throw new ApiError(500, "Error while updating team balance")
    }

    res.status(200).json(
        new ApiResponse(200, response, "Updated team balance successfully")
    )
})

const resetPortfolio = asyncHandler(async(req,res) => {
    
    let response = await TeamDetails.updateMany(
        {},
        {$set: {"portfolio.$[].numberOfStocks" : 0}}
    )

    if(!response) {
        throw new ApiError(500, "Error while reseting the portfolio")
    }
    
    res.status(200).json(
        new ApiResponse(200, response, "Reset portfolio done successfully")
    )
})

const getLeaderBoard = asyncHandler(async(req,res) => {
    
    let leaderboardResponse = await TeamDetails.aggregate([
        {
            $match: {
                "isDummy" : false
            }
        },
        {
            $unwind: "$portfolio"
        },
        {
            $lookup: {
                from: "stocks",
                localField : "portfolio.stocks",
                foreignField: "_id",
                as: "stockDetails"
            }   
        },
        {
            $addFields: {
                "valuation": {
                  $getField : {
                    "field" : "valuation",
                    "input" : {$arrayElemAt: ["$stockDetails",0]}
                  }
                },
                 "availableStocks": {
                  $getField : {
                    "field" : "availableStocks",
                    "input" : {$arrayElemAt: ["$stockDetails",0]}
                  }
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                "portfolioWorth": {
                  $sum: {
                    $multiply : ["$portfolio.numberOfStocks", {$divide: ["$valuation","$availableStocks"]}]
                  }
                },
                "currentBalance" : {
                  $addToSet: "$currentBalance"
                }
              }
        },
        {
            $addFields: {
                "currentBalance": {
                  $arrayElemAt : ["$currentBalance", 0]
                }
              }
        },
        {
            $addFields: {
                totalWorth: {$add: ["$portfolioWorth","$currentBalance"]}
              }
        },
        {
            $sort: {
                "totalWorth" : -1
              }
        },
        {
            $lookup: {
                from: "teamdetails",
                localField: "_id",
                foreignField: "_id",
                as: "teamDetails"
              }
        },
        {
            $lookup: {
                from: "teammembers",
                localField: "teamDetails.teamMembers",
                foreignField: "_id",
                as: "teamMembers"
            }
        },
        {
            $addFields: {
                "teamDetails": {
                  $arrayElemAt: ["$teamDetails", 0]
                }
              }	
        }
    ])

    if(leaderboardResponse == null) {
        throw new ApiError(500, "Error while fetching leaderboard")
    }

    res.status(200).json(
        new ApiResponse(200, leaderboardResponse, "Leaderboard fetched successfully")
    )
})

const getWorth = asyncHandler(async(req,res) => {
    const {id} = req.query
    
    if(id == null ) {
        throw new ApiError(400, "Id field is required as a query params")
    }

    let objectId = new mongoose.Types.ObjectId(id)

    let worthResponse = await TeamDetails.aggregate([
        {
            $match: {
                "_id" : objectId,
                // "isDummy" : false,
                // _id : new Schema.Types.ObjectId(id)
            }
        },
        {
            $unwind: "$portfolio"
        },
        {
            $lookup: {
                from: "stocks",
                localField : "portfolio.stocks",
                foreignField: "_id",
                as: "stockDetails"
            }   
        },
        {
            $addFields: {
                "valuation": {
                  $getField : {
                    "field" : "valuation",
                    "input" : {$arrayElemAt: ["$stockDetails",0]}
                  }
                },
                 "availableStocks": {
                  $getField : {
                    "field" : "availableStocks",
                    "input" : {$arrayElemAt: ["$stockDetails",0]}
                  }
                }
            }
        },
        {
            $group: {
                _id: "$_id",
                "portfolioWorth": {
                  $sum: {
                    $multiply : ["$portfolio.numberOfStocks", {$divide: ["$valuation","$availableStocks"]}]
                  }
                },
                "currentBalance" : {
                  $addToSet: "$currentBalance"
                }
              }
        },
        {
            $addFields: {
                "currentBalance": {
                  $arrayElemAt : ["$currentBalance", 0]
                }
              }
        },
        {
            $addFields: {
                totalWorth: {$add: ["$portfolioWorth","$currentBalance"]}
              }
        },
    ])

    if(worthResponse == null) {
        throw new ApiError(500, "Error while fetching worth details")
    }

    if(worthResponse.length == 0) {
        res.status(404).json(
            new ApiResponse(404, null, "No such team found")
        )
    }

    res.status(200).json(
        new ApiResponse(200, worthResponse[0], "Worth details fetched successfully")
    )

})

export {addTeam, getTeam, deleteTeam, getAllTeams, getPortfolioDetails, authenticateTeam, setTeamBalance, resetPortfolio, getLeaderBoard, getWorth}