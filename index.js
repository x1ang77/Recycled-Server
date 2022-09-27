const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const { PORT, DB_HOST, DB_PORT, DB_NAME } = process.env;

// mongoose.connect(`mongodb://${DB_HOST}:${DB_PORT}/${DB_NAME}`);

mongoose.connect(
    "mongodb+srv://XiangZe:Mcfc1234@cluster0.lnaghki.mongodb.net/?retryWrites=true&w=majority"
);

app.use("/users", require("./routes/users"));
app.use("/deposits", require("./routes/deposits"));
app.use("/rewards", require("./routes/rewards"));

app.listen(PORT, () => console.log("Server is running on PORT: " + PORT));
mongoose.connection.once("open", () =>
    console.log("We are connected to MongoDB")
);
