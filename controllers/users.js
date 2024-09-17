import User from '../models/user.js';

const registerPage = (req, res) => {
	res.render('users/register.ejs');
};

const registerNewUser = async (req, res) => {
	try {
		const {email, username, password} = req.body;
		const user = new User({email, username});
		const registeredUser = await User.register(user, password);
		req.login(registeredUser, err => {
			if (err) return next(err);
			req.flash('success', 'Welcome to Yelp Camp.');
			res.redirect('/campgrounds');
		});
	} catch (e) {
		req.flash('error', e.message);
		res.redirect('/register');
	}
};

const loginPage = (req, res) => {
	res.render('users/login.ejs');
};

const loginUser = (req, res) => {
	req.flash('success', 'Login Successful');
	const redirectUrl = res.locals.returnTo || '/campgrounds';
	res.redirect(redirectUrl);
};

const logoutUser = (req, res) => {
	req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', 'Logged out Successfully.');
        res.redirect('/campgrounds');
    });
};

export default {
	registerPage,
	registerNewUser,
	loginPage,
	loginUser,
	logoutUser
};