import Campground from '../models/campgrounds.js';
import {cloudinary} from '../cloudinary/index.js';
import * as maptilerClient from '@maptiler/client';

maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

const index = async (req, res) => {
	const allcamps = await Campground.find({});
	res.render('campgrounds/index', {allcamps});
};

const renderNewCamp = (req, res) => {
	res.render('campgrounds/new.ejs');
}

const createNewCamp = async (req, res, next) => {
	const geoResult = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
	const newCampground = new Campground(req.body.campground);
	newCampground.geometry = geoResult.features[0].geometry;
	newCampground.images = req.files.map(f => ({url: f.path, filename: f.filename}));
	newCampground.author = req.user._id;
	await newCampground.save();
	req.flash('success', 'New Campground successfully made.');
	res.redirect(`/campgrounds/${newCampground._id}`);
}

const showCamp = async (req,res) => {
	const campground = await Campground.findById(req.params.id).populate({
		path: 'reviews',
		populate: {
			path: 'author'
		}
	}).populate('author');
	if (!campground) {
		req.flash('error', 'Campground does not exist.');
		res.redirect('/campgrounds');
		return;
	}
	res.render('campgrounds/show.ejs', {campground});
}

const editCamp = async (req,res) => {
	const campground = await Campground.findById(req.params.id);
	if (!campground) {
		req.flash('error', 'Campground does not exist.');
		res.redirect('/campgrounds');
		return;
	}
	res.render('campgrounds/edit.ejs', {campground});
}

const updateCamp = async (req, res) => {
	const {id} = req.params;
	const geoResult = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });
	const updatedCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
	updatedCamp.geometry = geoResult.features[0].geometry;
	const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
	updatedCamp.images.push(...imgs);
	await updatedCamp.save();
	if (req.body.deleteImages) {
		for (let filename of req.body.deleteImages) {
			cloudinary.uploader.destroy(filename);
		}
		await updatedCamp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
	}
	req.flash('success', 'Campground successfully updated.');
	res.redirect(`/campgrounds/${updatedCamp._id}`);
}

const deleteCamp = async (req, res) => {
	const {id} = req.params;
	await Campground.findByIdAndDelete(id);
	req.flash('success', 'Campground successfully deleted.');
	res.redirect('/campgrounds');
}

export default {
	index, 
	renderNewCamp, 
	createNewCamp, 
	showCamp,
	editCamp,
	updateCamp,
	deleteCamp
};