import express from 'express';
import mongoose from 'mongoose';
import url from 'url';
import path from 'path';
import methodOverride from 'method-override';
import ejsMate from 'ejs-mate';
import {expressError} from './utils/expressError.js';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import localStrat from 'passport-local';
import User from './models/user.js';
import mongoSanitize from 'express-mongo-sanitize';
import campgRoutes from './routes/campgrounds.js';
import reviewRoutes from './routes/reviews.js';
import userRoutes from './routes/users.js';
import helmet from 'helmet';
import connectMongo from 'connect-mongo';

const dbURL = 'mongodb://localhost:27017/yelp-camp';

mongoose.connect(dbURL);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
	console.log('database connected');
});

const app = express();
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());

const store = connectMongo.create({
    mongoUrl: dbURL,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on('error', function (e) {
	console.log('SESSION STORE ERROR', e);
});

const sessionconfig = {
	store,
	name: 'session',
	secret: 'thisissomesecretrighthere',
	resave: false,
	saveUninitialised: true,
	cookie: {
		expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
		maxAge: 1000 * 60 * 60 * 24 * 7,
		//secure: true,
		httpOnly: true
	}
};
app.use(session(sessionconfig));
app.use(flash());
app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.tiles.mapbox.com/",
    // "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    // "https://api.mapbox.com/",
    // "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://cdn.maptiler.com/", // add this
];
const connectSrcUrls = [
    // "https://api.mapbox.com/",
    // "https://a.tiles.mapbox.com/",
    // "https://b.tiles.mapbox.com/",
    // "https://events.mapbox.com/",
    "https://api.maptiler.com/", // add this
];
const fontSrcUrls = [];

app.use(
	helmet.contentSecurityPolicy({
		directives: {
			defaultSrc: [],
			connectSrc: ["'self'", ...connectSrcUrls],
			scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
			styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
			workerSrc: ["'self'", "blob:"],
			objectSrc: [],
			imgSrc: [
				"'self'",
				"blob:",
				"data:",
				"https://res.cloudinary.com/dpbdgfr8w/",
				"https://images.unsplash.com/",
				"https://api.maptiler.com/"
			],
			fontSrc: ["'self'", ...fontSrcUrls]
		}
	})
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrat(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
	//console.log(req.query);
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.success = req.flash('success');
	next();
});

app.use('/', userRoutes);
app.use('/campgrounds', campgRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);

app.get('/', (req, res) => {
	res.render('home');
});

app.all('*', (req, res, next) => {
	next(new expressError('Page not found', 404));
});

app.use((err, req, res, next) => {
	const {status=500} = err;
	if (!err.message) err.message = 'something went wrong';
	res.status(status);
	res.render('error.ejs', {err});
});

app.listen(3000, () => {
	console.log('serving on port 3000.');
});

/*
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
*/