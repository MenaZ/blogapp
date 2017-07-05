const app = require('express')();
const Sequelize = require('sequelize');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser'());
const session = require('express-session');
const db = new Sequelize('nodeblog',process.env.POSTGRES_USER,
	process.env.POSTGRES_PASSWORD, {
    host: 'localhost',
    dialect: 'postgres',
    define: {
        timestamps: true
    }
});


app.use ('/', bodyParser());
app.use(express.static('public'));

app.set('views', 'views');
app.set('view engine', 'pug');

// create session
app.use(session({
  secret: '',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true }
}));

var User = db.define('user', {
		username: {
			type: Sequelize.STRING,
		unique: true
	},
		firstname:  {
			type: Sequelize.STRING,
		unique: true
	},
		lastname: {
           type: Sequelize.STRING,
         unique:true
    },
		email: { 
			type: Sequelize.STRING,
		unique: true
	},
		password: {
			type: Sequelize.STRING,
		unique: true 
	},
	
});     

var Message = db.define('message', {
	 	title: {
          type: Sequelize.STRING,
         }
	 	message: Sequelize.STRING
})

var Comment =db.define('comment', {
			comment: Sequelize.STRING
})


// establishing relationships
User.hasMAny(Message);
User.hasMany(Comment);
Message.belongTo(User);
Message.hasMany(Comment);
Comment.belongsTo(User);
Comment.belongsTo(Message);

db.sync();

//routes
//homepage route
app.get('/', (response,request)=> {
	response.render('blog')

}


app.post('/createUser', (response,request)=> {
	var password = req.body.password
	bcrypt.hash(password, 10, (err, hash) => {		
		if (err) throw err;	
		user.create({
		username:request.body.firstname,
		firstname:request.body.lastname,
		lastname:request.body.email,
		email:request.body.email,
		password: request.body.email // bcrypt.hash
	    })
	 })
	 response.redirect('/login')  

	 //Login page
app.get('/login', (response, request) => {
	res.render('login');		
});

app.post('/login', (response, request) => {
		User.findOne({
			where: {
				username: req.body.username
			}
		})
.then((user) => {
			var password = req.body.password
			bcrypt.compare(password, user.password, (err, data) => {	//validate password
				if (err) throw err;
				if (user !== null && data == true) 
				{
					req.session.user = user;				//this starts session for user
					res.redirect('/profile');
				} 
				else {
					res.redirect('/login?message=' + encodeURIComponent("Username or Password Invalid."));
				}
			});
		})
		.catch((error) => {
			res.redirect('/?message=' + encodeURIComponent('Error Has Occurred, Check The Server.'));
		});
});

//Profile page
app.get('/profile', (response, request) => {
	var user = req.session.user;
    if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Log In To View Profile."));
    } else {
        res.render('profile', {
            user: user
        });
    }
});

//User's posts page
app.get('/myposts', (response, request) => {
	var user = req.session.user;
    if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Log In To View Your Posts."));
        return;
    } else {
    	User.findAll()
    	.then((users) => {
    		Post.findAll({
				where: {
					userId: user.id
				},
				include: [{
					model: Comment,
					as: 'comments'
					}]
			})
			.then((posts) => {
				res.render('myposts', {
					users: users, 
					posts: posts
				})
			})
    	})
		.catch((error) => {
			console.log('Error Occured', error);
			res.redirect('/?message=' + encodeURIComponent('Error Occured Check The Server.'));
		});
	}
});

//Create a new post page
app.get('/newpost', (response,request) => {
	var user = req.session.user;
    if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Please log in to create a new post."));
    } else {
    	res.render('newpost');
    }
})

app.post('/newpost', (response, request) => {				
	var user = req.session.user;
	Post.create({						//sync to database for input new row Post
		title: req.body.title,
		body: req.body.body,
		userId: user.id || 0 //if it does not exist it is a 0, which means something is wrong
		})
	.then(() => {
			res.redirect('/myposts');
	})
	.catch((error) => {
			console.log('Error Occured', error);
			res.redirect('/?message=' + encodeURIComponent('Error Occured Check The Server.'));
	});
});


//View everybody's posts page
app.get('/viewall', (response, request) => {
	var user = req.session.user;
	if (user === undefined) {				//only accessible for logged in users
        res.redirect('/login?message=' + encodeURIComponent("Please log in to view all posts."));
    } else {
    	User.findAll()			//find User and Post data for use in /viewall
    	.then((users) => {
    		Post.findAll({
    			include: [{				//show posts including comments
    				model: Comment,
    				as: 'comments'
    			}]
    		})
			.then((posts) => {
					res.render('viewall', {
						posts: posts,
						users: users,
					})
			})
    	})
		.catch((error) => {
			console.log('Error Occured', error);
			res.redirect('/?message=' + encodeURIComponent('Error Occured Check The Server.'));
		});
	}
});

//Comment route
app.post('/comment', (response, request) => {
	var user = req.session.user;
	User.findOne({
		where: {
			username: user.username
		}
	})
	.then((user) => {
		return Comment.create({
				body: req.body.comment,
				postId: req.body.postId,
				userId: user.id
			})
		.then(() => {
				res.redirect('/viewall');
			})
		})
	.catch((error) => {
			console.log('Error Occured!', error);
			res.redirect('/?message=' + encodeURIComponent('Error Occured Check The Server.'));
	})
});

//Log out route that redirects to home
app.get('/logout', (response, request) => {
	req.session.destroy(function(error) {			//destroy session after logout
		if(error) {
			throw error;
		}
		res.redirect('/?message=' + encodeURIComponent("Successfully logged out."));
	});
});

//server


const server = app.listen(3000, () => {
	console.log("The server has started at port:" + server.address().port);
});


}