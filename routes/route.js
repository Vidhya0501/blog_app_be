import express from 'express';

import { createPost, updatePost, deletePost, getPost, getAllPosts } from '../controllers/postController.js';
import { uploadImage, getImage } from '../controllers/imageController.js';
import { newComment, getComments, deleteComment } from '../controllers/commentController.js';
import { loginUser, singupUser, logoutUser } from '../controllers/userController.js';
import { authenticateToken, createNewToken } from '../controllers/jwtController.js';

import upload from '../utils/upload.js';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', singupUser);
router.post('/logout', logoutUser);

router.post('/token', createNewToken);

router.post('/create', authenticateToken, createPost);
router.put('/update/:id', authenticateToken, updatePost);
router.delete('/delete/:id', authenticateToken, deletePost);

router.get('/post/:id', authenticateToken, getPost);
router.get('/posts', authenticateToken, getAllPosts);

router.post('/file/upload', upload.single('file'), uploadImage);
router.get('/file/:filename', getImage);

router.post('/comment/new', authenticateToken, newComment);
router.get('/comments/:id', authenticateToken, getComments);
router.delete('/comment/delete/:id', authenticateToken, deleteComment);

export default router;