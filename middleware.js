import Campground from './models/campgrounds.js';
import Review from './models/review.js';
import {expressError} from './utils/expressError.js';
import {campgReqSchema, reviewSchema} from './schemas.js';

export const isLoggedIn = (req, res, next) => {
	if(!req.isAuthenticated()) {
		req.session.returnTo = req.originalUrl;
		req.flash('error', 'You need to be Logged In.');
		return res.redirect('/login');
	}
	next();
};

export const storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
};

export const isAuthor = async (req, res, next) => {
	const {id} = req.params;
	const foundCamp = await Campground.findById(id);
	if(!foundCamp.author.equals(req.user._id)) {
		req.flash('error', 'You don\'t have the permission.');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
};

export const isReviewAuthor = async (req, res, next) => {
	const {id, reviewId} = req.params;
	const foundReview = await Review.findById(reviewId);
	if(!foundReview.author.equals(req.user._id)) {
		req.flash('error', 'You don\t have the permission.');
		return res.redirect(`/campgrounds/${id}`);
	}
	next();
}

export const validateCamps = (req, res, next) => {
	const {error} = campgReqSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new expressError(msg, 400);
	} else {
		next();
	}
};

export const validateReview = (req, res, next) => {
	const {error} = reviewSchema.validate(req.body);
	if (error) {
		const msg = error.details.map(el => el.message).join(',');
		throw new expressError(msg, 400);
	} else {
		next();
	}
};