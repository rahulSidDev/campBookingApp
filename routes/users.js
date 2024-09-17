import express from 'express';
import passport from 'passport';
import catchAsync from '../utils/catchAsync.js';
import {storeReturnTo} from '../middleware.js';
import users from '../controllers/users.js';

const router = express.Router();

router.route('/register')
	.get(users.registerPage)
	.post(catchAsync(users.registerNewUser));

router.route('/login')
	.get(users.loginPage)
	.post(storeReturnTo, passport.authenticate('local', {failureFlash: true, failureRedirect: '/login'}), users.loginUser);

router.get('/logout', users.logoutUser);

export default router;