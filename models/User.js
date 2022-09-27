const mongoose = require("mongoose");
const UserSchema = new mongoose.Schema({
    username: {
        type: String,
    },
    password: {
        type: String,
    },
    email: {
        type: String,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    points: {
        type: Number,
        default: 0,
    },
});

module.exports = mongoose.model("user", UserSchema);
