const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Reward = require("../models/Reward");
const User = require("../models/User");

const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

// const { check, validationResult } = require("express-validator");

router.get("/", async (req, res) => {
    try {
        let rewards = await Reward.find({});
        if (rewards.length == 0) return res.json({ msg: "No rewards found" });

        return res.json(rewards);
    } catch (e) {
        return res.status(400).json({ e, msg: "Cannot retrieve items" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        let rewards = await Reward.findById(req.params.id);
        if (rewards.length == 0)
            return res.json({
                msg: "No rewards found",
            });
        return res.json(rewards);
    } catch (e) {
        return res.json({
            e,
            msg: "Reward cannot be found",
        });
    }
});

// Redeem Reward
router.post("/:id", auth, async (req, res) => {
    console.log("hi");
    try {
        const { points } = req.body;
        let userId = req.params.id;

        let user = await User.findById(userId);
        if (!user)
            return res.status(401).send({ message: "Cant redeem reward" });
        user.points -= points;
        user.save();
        return res.json(user);
        if (!user) return res.status(400).json({ e, message: "No user" });
    } catch (e) {
        return res.status(400).json({ e, message: "Reward not found" });
    }
});

//Add Reward
router.post("/", auth, async (req, res) => {
    try {
        if (!req.user.isAdmin)
            return res.status(401).send({ message: "You are not an admin" });

        let form = new formidable.IncomingForm();

        form.parse(req, (e, fields, files) => {
            const reward = new Reward(fields);
            let oldPath = files.image.filepath;
            let newPath =
                path.join(__dirname, "../public") +
                `/${files.image.newFilename}-${files.image.originalFilename}`;
            let rawData = fs.readFileSync(oldPath);
            fs.writeFileSync(newPath, rawData);
            reward.image = `/${files.image.newFilename}-${files.image.originalFilename}`;
            reward.save();
            return res.json({ reward, message: "Reward added successfully" });
        });
    } catch (e) {
        return res.status(400).json({ e, msg: "Cannot add reward" });
    }
});

//Update Reward
router.put("/:id", auth, async (req, res) => {
    try {
        if (!req.user.isAdmin)
            return res.status(401).json({ message: "You are unauthorized" });

        const reward = await Reward.findById(req.params.id);

        if (!reward) return res.json({ message: "Reward doesn't exist" });

        const form = new formidable.IncomingForm();

        form.parse(req, async (e, fields, files) => {
            if (files.image) {
                let oldPath = files.image.filepath;
                let newPath =
                    path.join(__dirname, "../public") +
                    `/${files.image.newFilename}-${files.image.originalFilename}`;
                let rawData = fs.readFileSync(oldPath);
                fs.writeFileSync(newPath, rawData);
                reward.image = `/${files.image.newFilename}-${files.image.originalFilename}`;
                await reward.save();
            }
            delete fields.image;
            await Reward.findByIdAndUpdate(req.params.id, fields, {
                new: true,
            });
            return res.json({ message: "Reward updated successfully", reward });
        });
    } catch (e) {
        return res.status(400).json({ e, msg: "Cannot update reward" });
    }
});

//Delete Reward
router.delete("/:id", auth, async (req, res) => {
    try {
        let rewards = await Reward.findById(req.params.id);
        if (!rewards)
            return res.status(400).json({
                msg: "No rewards found",
            });
        if (!req.user)
            return res.status(401).send({
                msg: "You are not an admin",
            });
        let newRewards = await Reward.findByIdAndDelete(req.params.id);
        return res.json(newRewards);
    } catch (e) {
        return res.json({
            e,
            msg: "Cannot get rewards",
        });
    }
});

module.exports = router;
