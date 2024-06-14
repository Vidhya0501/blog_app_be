import express from "express";

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

import User from "../models/user.js";
import Post from "../models/post.js";
import Comment from "../models/comment.js";
import cloudinary from "../utils/cloudinary.js";

import validate from "../middleware/validate.js";

import upload from "../utils/multer.js";

const router = express.Router();
dotenv.config();
//signup
router.post("/signup", async (req, res) => {
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
});

//login

router.post("/login", async (req, res) => {
  let user = await User.findOne({ username: req.body.username });
  if (!user) {
    return res.status(400).json({ msg: "Username does not match" });
  }

  try {
    let match = await bcrypt.compare(req.body.password, user.password);
    if (match) {
      const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY, {
        expiresIn: "1d",
      });
      res.status(200).send({
        message: "Login successful",
        success: true,
        data: token,
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
});

router.post("/create", validate, upload.single("image"),
  async (req, res) => {
    try {
      // Upload image to cloudinary
      const result = await cloudinary.uploader.upload(req.file.path);
console.log(result)
      let post = new Post({
        title: req.body.title,
        description: req.body.description,
        categories: req.body.categories,
        username: req.body.username,
        picture: result.secure_url,
       
      });
      await post.save();

      res.status(200).json(post);
    } catch (error) {
      res.status(500).json(error);
    }
  }
);
router.put("/update/:id", validate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      res.status(404).json({ msg: "Post not found" });
    }

    await Post.findByIdAndUpdate(req.params.id, { $set: req.body });

    res.status(200).json("post updated successfully");
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/delete/:id", validate, async (req, res) => {
  try {
    const postId = req.params.id;
    // Perform deletion logic, e.g., using Mongoose
    await Post.findByIdAndDelete(postId);
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

router.get("/post/:id", validate, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/posts", validate, async (req, res) => {
  let username = req.query.username;
  let category = req.query.category;
  let posts;
  try {
    if (username) posts = await Post.find({ username: username });
    else if (category) posts = await Post.find({ categories: category });
    else posts = await Post.find({});

    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.post("/comment/new", validate, async (req, res) => {
  try {
    const comment = await new Comment(req.body);
    comment.save();

    res.status(200).json("Comment saved successfully");
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/comments/:id", validate, async (req, res) => {
  try {
    const comments = await Comment.find({ postId: req.params.id });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/comment/delete/:id", validate, async (req, res) => {
  try {
    const commentId = req.params.id;
    // Perform deletion logic, e.g., using Mongoose
    await Comment.findByIdAndDelete(commentId);
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.error("Error deleting comment:", error);
    res.status(500).json({ errorMessage: "Internal server error" });
  }
});

export default router;
