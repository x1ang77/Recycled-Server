const mongoose = require("mongoose");
const DepositSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    location: {
        type: String,
    },
    plasticWeight: {
        type: Number,
    },
    mWeight: {
        type: Number,
    },
    paperWeight: {
        type: Number,
    },
    date: {
        type: String,
    },
    gWeight: {
        type: Number,
    },
    points: {
        type: Number,
    },
    image: {
        type: String,
    },
});

module.exports = mongoose.model("deposits", DepositSchema);
