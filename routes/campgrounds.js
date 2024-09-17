import express from 'express';
import catchAsync from '../utils/catchAsync.js';
import {isLoggedIn, validateCamps, isAuthor} from '../middleware.js';
import campgrounds from '../controllers/campgrounds.js';
import multer from 'multer';
import {storage} from '../cloudinary/index.js';

const router = express.Router();
//const storage = cloudinaryImport.storage;
const upload = multer({storage});

router.route('/')
	.get(catchAsync(campgrounds.index))
	.post(isLoggedIn, upload.array('image'), validateCamps, catchAsync(campgrounds.createNewCamp));

router.get('/new', isLoggedIn, campgrounds.renderNewCamp);

router.route('/:id')
	.get(catchAsync(campgrounds.showCamp))
	.put(isLoggedIn, isAuthor, upload.array('image'), validateCamps, catchAsync(campgrounds.updateCamp))
	.delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCamp));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.editCamp));

export default router;