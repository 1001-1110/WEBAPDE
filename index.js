const express = require('express')
const cool = require('cool-ascii-faces')
const path = require('path')
const bodyparser = require("body-parser")
const request = require('request')
const hbs = require("hbs")
hbs.registerPartials(path.join(__dirname,'/views/partials'))
const session = require("express-session")
const cookieparser = require("cookie-parser")
const urlencoder = bodyparser.urlencoded({
	extended: false
})
const PORT = process.env.PORT || 5000
const bcrypt = require("bcrypt")
const mongoose = require("mongoose")     
mongoose.connect('mongodb://Nine:trexfire6@ds145951.mlab.com:45951/heroku_0n46js2x',
{
    useNewUrlParser:true
})
var User = mongoose.model("userList",{
	emailAddress : String,
	username : String,
	password : String,
	shortBio : String,
	avatar: String,
	post: [{
		postID: String,
		postTitle: String,
		postDescription: String,
		postAuthor: String,
		postDate: String,
		postScore: Number,
		commentNumber: Number
	}],
	comment: [{
		commentID: String,
		commentContent: String,
		commentAuthor: String,
		commentDate: String,
		commentScore: Number
	}]
})
var Post = mongoose.model("postList",{
	postTitle: String,
	postDescription: String,
	postAuthor: String,
	postDate: String,
	postScore: Number,
	commentNumber: Number,
	comment: [{
		commentID: String,
	}]
})

var Comment = mongoose.model("commentList",{
	commentContent: String,
	commentAuthor: String,
	commentDate: String,
	commentScore: Number,
	nestedComments: [{
		commentID: String
	}]
})

express()
	.use(session({
		saveUninitialized: true,
		resave: true,
		secret: "nicokayejosh",
		name: "Nico's Cookie",
		cookie: {
			maxAge: 1000 * 60 * 60 * 24 * 7 * 3
		}
	}))

	.use(cookieparser())

	.use(express.static(path.join(__dirname, 'public')))
	.set('views', path.join(__dirname, 'views'))
	.set('view engine', 'hbs')

	.get('/', urlencoder, (req, res) => {
		var findPosts = Post.find()
		findPosts.then((foundPosts)=>{
			var postIDs = []
			var postTitles = []
			var postDescriptions = []
			var postAuthors = []
			var postDates = []
			var postScores = []
			var commentNumbers = []
			for(let i = 0 ; i < foundPosts.length ; i++){
				postIDs.push(foundPosts[i]._id)
				postTitles.push(foundPosts[i].postTitle)
				postDescriptions.push(foundPosts[i].postDescription)
				postAuthors.push(foundPosts[i].postAuthor)
				postDates.push(foundPosts[i].postDate)
				postScores.push(foundPosts[i].postScore)
				commentNumbers.push(foundPosts[i].commentNumber)				
			}
			res.render("./pages/index.hbs", {
				uname: req.session.username,
				postIDs, postTitles, postDescriptions, postAuthors, postDates, postScores, commentNumbers
			})
		})
	})

	/*
	commentContent: String,
	commentAuthor: String,
	commentDate: String,
	commentScore: Number,
	comment: [{
		commentID: String,
		commentContent: String,
		commentAuthor: String,
		commentDate: String,
		commentScore: Number
	}]
	*/

	.get('/post', (req, res) => {
		var findPost = Post.findOne({
			_id : req.query.id
		})
		findPost.then((foundPost)=>{
			if(foundPost){
				var comments = []
				var comment = []
				for(let i = 0 ; i < foundPost.comment.length ; i++){
					comment.push(foundPost.comment[i].commentContent)
					comment.push(foundPost.comment[i].commentAuthor)
					comment.push(foundPost.comment[i].commentDate)
					comment.push(foundPost.comment[i].commentScore)
				}
                res.render("./pages/post.hbs", {
                	postTitle: foundPost.postTitle,
                	postDescription: foundPost.postDescription,
                	postAuthor: foundPost.postAuthor,
                	postDate: foundPost.postDate,
                	postScore: foundPost.postScore,
                	commentNumber: foundPost.commentNumber,
					uname: req.session.username
                })
			}else{
				res.send("Not found.")
			}
		})
    })

	.get('/user-profile', (req, res) => {
		if(req.query.u){
			var findUser = User.findOne({
				username : req.query.u,
			})
			findUser.then((foundUser)=>{
				if(foundUser){
					var findPosts = Post.find({postAuthor : foundUser.username},{ _id : {$slice: 5} })
					findPosts.then((foundPosts)=>{
						var postIDs = []
						var postTitles = []
						var postDescriptions = []
						var postAuthors = []
						var postDates = []
						var postScores = []
						var commentNumbers = []
						for(let i = 0 ; i < foundPosts.length ; i++){
							postIDs.push(foundPosts[i]._id)
							postTitles.push(foundPosts[i].postTitle)
							postDescriptions.push(foundPosts[i].postDescription)
							postAuthors.push(foundPosts[i].postAuthor)
							postDates.push(foundPosts[i].postDate)
							postScores.push(foundPosts[i].postScore)
							commentNumbers.push(foundPosts[i].commentNumber)				
						}	
					})
					res.render("./pages/user-profile.hbs", {
						userHandle: "@"+foundUser.username,
						userBioData: foundUser.shortBio,
						uname: req.session.username
					})			
				}else{
					res.send("Not found.")
				}
			})		
		}else{
			res.redirect("user-profile?u="+req.session.username)
		}
    })

	.get('/signin', (req, res) => res.render("./pages/signin.hbs"))

	.post('/signedin', urlencoder, (req, res) => {
		var findUser = User.findOne({
			username : req.body.username,
		})
		findUser.then((foundUser)=>{
			if(foundUser){
				bcrypt.compare(req.body.password, foundUser.password).then((msg)=>{
					if(msg){
						req.session.username = req.body.username
						res.redirect("/")
					}else{
						
					}
				})
			}else{
				res.send("User not found")
			}
		})
	})
	.post('/logout', (req, res) => {
		req.session.destroy()
		res.redirect("/")
	})
	.post('/registered', urlencoder, (req, res) => {
		var findUser = User.findOne({
			username : req.body.username
		})
		findUser.then((foundUser)=>{
			if(foundUser){
				res.send("User already exists")
			}else{
				bcrypt.hash(req.body.password,12).then((hashed)=>{
					var hashedPassword = hashed
					var newUser = new User({
						emailAddress : req.body.emailAddress,
						username : req.body.username,
						password : hashedPassword,
						shortBio : req.body.shortBio,
						avatar: req.body.avatar
					})
					newUser.save().then((msg)=>{
						req.session.username = req.body.username
						res.redirect("/")
					})
				})
			}
		})
	})

	.get('/site-map', urlencoder, (req, res) => res.render("./pages/sitemap.hbs"))
	.get('/register', (req, res) => res.render("./pages/register.hbs"))
	.get('/newpost', (req, res) => res.render("./pages/newpost.hbs", {
		uname: req.session.username
	}))
	.post('/createnewpost', urlencoder, (req, res) => {
		var newPost = new Post({
			postTitle: req.body.postTitle,
			postDescription: req.body.postTitle,
			postAuthor: req.session.username,
			postDate: "Filler Date",
			postScore: 0,
			commentNumber: 0
		})
		newPost.save().then((msg)=>{
			var newPostLink = "post?id="+newPost._id
			res.redirect(newPostLink)
		})
	})	
	.get('/editpost', (req, res) => res.render("./pages/editpost.hbs"))

	.listen(PORT, () => console.log(`Listening on ${ PORT }`))