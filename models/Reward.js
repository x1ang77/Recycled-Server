const mongoose = require("mongoose");
const RewardSchema = new mongoose.Schema({
    title: {
        type: String,
    },
    titletwo: {
        type: String,
    },
    points: {
        type: Number,
    },
    image: {
        type: String,
    },
});

module.exports = mongoose.model("rewards", RewardSchema);
