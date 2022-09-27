const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Deposit = require("../models/Deposit");
const User = require("../models/User");

const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

router.get("/", auth, async (req, res) => {
    try {
        if (!req.user.username) {
            return res.status(401).send({
                msg: "No deposits found",
            });
        }
        let deposits = await Deposit.find({
            username: req.user.username,
        });

        console.log(deposits);

        if (deposits.length == 0)
            return res.status(400).json({
                msg: "No deposits found",
            });
        return res.json(deposits);
    } catch (e) {
        return res.status(400).json({
            e,
            msg: "Cannot retrieve deposits",
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        let deposits = await Deposit.findById(req.params.id);
        if (deposits.length == 0)
            return res.json({
                msg: "No deposits found",
            });
        return res.json(deposits);
    } catch (e) {
        return res.json({
            e,
            msg: "Deposit cannot be found",
        });
    }
});

router.post("/", auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) {
            return res.status(401).send({
                message: "You are not an admin",
            });
        }

        let form = new formidable.IncomingForm();

        form.parse(req, async (e, fields, files) => {
            const deposit = new Deposit(fields);

            // let userPoints = await User.findOne({
            //     points: deposit.points,
            // });
            console.log(deposit);

            let userFound = await User.findOne({
                username: deposit.username,
            });

            if (!userFound) {
                return res.status(400).json({
                    message: "Username doesn't exist",
                });
            }

            let totalPoints = 0;

            totalPoints += parseInt(deposit.plasticWeight * 10);
            totalPoints += parseInt(deposit.mWeight * 30);
            totalPoints += parseInt(deposit.paperWeight * 10);
            totalPoints += parseInt(deposit.gWeight * 20);
            deposit.points = totalPoints;

            userFound.points += totalPoints;
            userFound.save();

            let oldPath = files.image.filepath;
            let newPath =
                path.join(__dirname, "../public") +
                `/${files.image.newFilename}-${files.image.originalFilename}`;
            let rawData = fs.readFileSync(oldPath);
            fs.writeFileSync(newPath, rawData);
            deposit.image = `/${files.image.newFilename}-${files.image.originalFilename}`;
            deposit.save();

            return res.status(400).json({
                deposit,
                message: "Deposit added successfully",
            });
        });
    } catch (e) {
        return res.status(400).json({
            e,
            message: "Cannot add deposit",
        });
    }
});

router.delete("/:id", auth, async (req, res) => {
    try {
        let deposits = await Deposit.findById(req.params.id);
        if (!deposits)
            return res.status(400).json({
                msg: "No deposits found",
            });
        if (!req.user)
            return res.status(401).send({
                msg: "You are not an admin",
            });
        let newDeposits = await Deposit.findByIdAndDelete(req.params.id);
        return res.json(newDeposits);
    } catch (e) {
        return res.json({
            e,
            msg: "Cannot get deposits",
        });
    }
});

module.exports = router;
