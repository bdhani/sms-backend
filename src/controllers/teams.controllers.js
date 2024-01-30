import { TeamDetails, TeamMember } from "../models/teams.model.js";
import { Stocks } from "../models/stocks.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose"

const addTeam = asyncHandler(async(req,res)=> {
    const {teamDetails, teamName, teamId} = req.body
    let id = parseInt(teamId)

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
            "numberOfStocks": 0
        }
        // console.log(data)
        portfolio.push(data)
    })

    let team = await TeamDetails.create({
        teamName,
        teamMembers,
        teamId : id,
        portfolio : portfolio
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
                "teamMembers"  : 0
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
                "teamMembers"  : 0
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
            "_id" : new mongoose.Types.ObjectId(id)
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
            $unwind : "$stockDetails"
        }, 
        {
            $addFields : {
                "stockDetails.sellingPrice": {$divide: ["$stockDetails.valuation","$stockDetails.availableStocks"]}
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

export {addTeam, getTeam, deleteTeam, getAllTeams, getPortfolioDetails}