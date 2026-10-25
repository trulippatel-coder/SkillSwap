const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema(
    {
        teacher: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        learner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        requestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Request"
        },
        skill: {
            type: String,
            required: true,
            trim: true
        },
        date: {
            type: String,
            required: true,
            trim: true
        },
        time: {
            type: String,
            required: true,
            trim: true
        },
        notes: {
            type: String,
            default: "",
            trim: true
        },
        status: {
            type: String,
            enum: ["scheduled", "completed", "cancelled"],
            default: "scheduled"
        }
    },
    {
        timestamps: true
    }
);

const Session = mongoose.model("Session", sessionSchema);

module.exports = Session;
