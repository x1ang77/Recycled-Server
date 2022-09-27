const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { check, validationResult } = require("express-validator");
const User = require("../models/User");
const Reward = require("../models/Reward");
require("dotenv").config();
router.post(
    "/register",
    check("username")
        .not()
        .isEmpty()
        .withMessage("Username should not be empty")
        .isLength({
            min: 8,
        })
        .withMessage("Username must be at least 8 characters long"),
    check("password")
        .not()
        .isEmpty()
        .withMessage("Password should not be empty")
        .isLength({
            min: 8,
        })
        .withMessage("Password must be at least 8 characters long"),
    check("email")
        .not()
        .isEmpty()
        .withMessage("Email should not be empty")
        .isEmail()
        .withMessage("Make sure its a valid email format"),
    async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const userFound = await User.findOne({
                username,
            });
            const userFound2 = await User.findOne({
                email,
            });
            if (userFound || userFound2)
                return res.status(400).json({
                    message: "User already exists",
                });

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json(errors.array());
            }
            const user = new User(req.body);
            let salt = bcrypt.genSaltSync(10);
            let hash = bcrypt.hashSync(password, salt);
            user.password = hash;
            user.save();
            return res.json({
                user,
                message: "Registered succesfully",
            });
        } catch (e) {
            return res.json({
                e,
                message: "Failed to register",
            });
        }
    }
);

router.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;
        let userFound = await User.findOne({
            username,
        });

        if (!userFound) {
            return res.status(400).json({
                message: "Username doesn't exist",
            });
        }

        let isMatch = bcrypt.compareSync(password, userFound.password);
        if (!isMatch) {
            return res.status(400).json({
                message: "Invalid Credentials",
            });
        }

        jwt.sign(
            {
                data: userFound,
            },
            process.env.SECRET_KEY,
            {
                expiresIn: "1h",
            },
            (err, token) => {
                if (err)
                    return res.status(400).json({
                        err,
                        message: "Cannot generate token",
                    });
                return res.json(token);
            }
        );
    } catch (e) {
        return res.status(400).json({
            e,
            message: "Invalid Credentials",
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user)
            return res.status(400).json({
                message: "No user found",
            });
        return res.json(user);
    } catch (e) {
        return res.status(400).json({
            e,
            message: "Cannot get user",
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        let user = await User.findById(req.params.id);
        if (!user)
            return res.status(400).json({
                message: "No user found",
            });
        let rewards = await Reward.findById(req.params.id);
        if (rewards.points - user.points < 0)
            return res.status(400).json({
                message: "Not enough points",
            });
        return res.json(user);
    } catch (e) {
        return res.status(400).json({
            e,
            message: "Cannot get user",
        });
    }
});
module.exports = router;
