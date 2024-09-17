import mongoose from 'mongoose';
import Campground from '../models/campgrounds.js';
import User from '../models/user.js';
import {places, descriptors} from './seedHelpers.js';
import {cities} from './cities.js';

mongoose.connect('mongodb://localhost:27017/yelp-camp');
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('database connected');
});

const sample = arr => arr[Math.floor(Math.random() * arr.length)];

const seedDB = async () => {
	await Campground.deleteMany({});
	for (let i = 0; i < 200; i++) {
		const randomNo = Math.floor(Math.random() * 1000);
		const randomPrice = Math.floor(Math.random() * 20) + 10;
		const locationString = `${cities[randomNo].city}, ${cities[randomNo].state}`;

		const camp = new Campground({
			author: '66da59d03e1242cde96f3968',
			location: locationString,
			title: `${sample(descriptors)} ${sample(places)}`,
			description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
			price: randomPrice,
			geometry: {
				type: "Point",
				coordinates: [
					cities[randomNo].longitude,
					cities[randomNo].latitude
				]
			},
			images: [
				{
					url: 'https://res.cloudinary.com/dpbdgfr8w/image/upload/v1725953451/YelpCamp/fvqjixkm3cnzxq8pn1un.jpg',
					filename: 'YelpCamp/fvqjixkm3cnzxq8pn1un'
				},
				{
					url: 'https://res.cloudinary.com/dpbdgfr8w/image/upload/v1725953451/YelpCamp/fzeflxaclu6ap2tki7c6.jpg',
					filename: 'YelpCamp/fzeflxaclu6ap2tki7c6'
				}
		    ]
		});
		
		await camp.save();
	}
};

seedDB().then(() => {
	mongoose.connection.close();
	console.log('connection to db closed.');
});