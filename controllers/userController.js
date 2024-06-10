import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import Token from "../models/token.js";
import User from "../models/user.js";

dotenv.config();

export const singupUser = async (req, res) => {
  try {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const user = new User(req.body);
    const existingUser = await User.findOne({ username: req.body.username });
    if (existingUser) {
      return res
        .status(200)
        .send({ message: "User already exists", success: false });
    } else {
      await user.save();
      return res
        .status(200)
        .send({ message: "User registered successfully", success: true });
    }
  } catch (error) {
    return res.status(500).send({ message: error.message, success: false });
  }
};

export const loginUser = async (req, res) => {
  let user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(400).json({ msg: "Username does not match" });
  }

  try {
    let match = await bcrypt.compare(req.body.password, user.password);
    if (match) {
      const accessToken = jwt.sign(
        user.toJSON(),
        process.env.ACCESS_SECRET_KEY,
        { expiresIn: "15d" }
      );
      const refreshToken = jwt.sign(
        user.toJSON(),
        process.env.REFRESH_SECRET_KEY
      );

      const newToken = new Token({ token: refreshToken });
      await newToken.save();

      res
        .status(200)
        .send({
          message: "Login successful",
          success: true,
          accessToken: accessToken,
          refreshToken: refreshToken,
          name: user.name,
          username: user.username,
        });
    } else {
      res
        .status(400)
        .json({ message: "Password does not match", success: false });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "error while login the user", success: false });
  }
};

export const logoutUser = async (req, res) => {
  const token = req.body.token;
  await Token.deleteOne({ token: token });

  res.status(204).json({ msg: "logout successfull" });
};
