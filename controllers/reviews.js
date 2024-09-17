import Review from '../models/review.js';
import Campground from '../models/campgrounds.js';

const createNewReview = async (req, res) => {
	const foundCamp = await Campground.findById(req.params.id);
	const newReview = new Review(req.body.review);
	newReview.author = req.user._id;
	foundCamp.reviews.push(newReview);
	await newReview.save();
	await foundCamp.save();
	req.flash('success', 'New Review successfully made.');
	res.redirect(`/campgrounds/${foundCamp._id}`);
}

const deleteReview = async (req, res) => {
	const {id, reviewId} = req.params;
	await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
	await Review.findByIdAndDelete(reviewId);
	req.flash('success', 'Review successfully deleted.');
	res.redirect(`/campgrounds/${id}`);
}

export default {createNewReview, deleteReview};