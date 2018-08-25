const express = require("express")
const router = express.Router()
const bodyparser = require("body-parser")
const User = require("../models/user.js")
const Post = require("../models/post.js")
const Comment = require("../models/comment.js")
const prettyMs = require('pretty-ms');
const timestamp = require('time-stamp');
const app = express()

const urlencoder = bodyparser.urlencoded({
	extended : true
})

router.use(urlencoder)

router.post("/edit", (req,res) =>{
	
	Post.edit(req.body.postID, req.body.postTitle, req.body.postContent).then((postID)=>{
	//	res.render("post/"+req.body.postID)
	},(error)=>{
		console.log(error);
	})

	User.edit(req.session.username ,req.body.postID, req.body.postTitle, req.body.postContent).then((postID)=>{
		res.send("post/"+req.session.username)
		//window.location.href("post/"+req.session.username)
	},(error)=>{
		console.log(error);
	})
})

router.get("/edit/:id", urlencoder, (req,res) =>{

	
	Post.get(req.params.id).then((post)=>{
		res.render("./pages/editpost", {	
			uname: req.session.username,
			postID: post._id,
			postTitle: post.postTitle,
			postContent: post.postDescription
		})
	},(error)=>{
		console.log(error);

	})
})


router.get("/search", (req, res) => {
	console.log("/search")

	Post.search(req.query.searchTerm).then((PostsWithKeywords) => {
		
	//	res.send(PostsWithKeywords)
		console.log("Found posts with keywords are: " + PostsWithKeywords)
		res.render("./pages/index", {
			PostsWithKeywords
		})
	}, (error)=>{
		console.log(error)
	})
})

router.get("/create", (req,res) =>{
	res.render("./pages/newpost", {
		uname: req.session.username
	})
})

router.post("/create", (req,res) =>{
	var newPost = {
		postTitle: req.body.postTitle,
		postDescription: req.body.postDescription,
		postAuthor: req.session.username,
		postDateString: timestamp('YYYY/MM/DD'),
		postDate: new Date(),
		postScore: 0,
		commentNumber: 0,
		comment: []
	}
	Post.put(newPost).then((newPost)=>{
		User.putPost(newPost).then((newPost)=>{
			res.redirect("/post/"+newPost._id)
		},(error)=>{
			res.redirect("/post/create")
		})
	},(error)=>{
		res.redirect("/post/create")
	})
})

router.get("/all", (req,res) =>{
	Post.getAll().then((posts)=>{
		res.send(posts)
	},(error)=>{

	})
})

router.get("/all/date", (req,res) =>{
	Post.getSortedDate().then((posts)=>{
		res.send(posts)
	},(error)=>{

	})
})

router.get("/all/score", (req,res) =>{
	Post.getSortedScore().then((posts)=>{
		res.send(posts)
	},(error)=>{

	})
})

router.post("/all/more", (req,res) =>{
	Post.getAllMore(parseInt(req.body.skipNum)).then((posts)=>{
		res.send(posts)
	},(error)=>{

	})
})

router.get("/all/date/more", (req,res) =>{
	Post.getSortedDateMore(parseInt(req.body.skipNum)).then((posts)=>{
		res.send(posts)
	},(error)=>{

	})
})

router.get("/all/score/more", (req,res) =>{
	Post.getSortedScoreMore(parseInt(req.body.skipNum)).then((posts)=>{
		res.send(posts)
	},(error)=>{

	})
})

// router.get("/search/:searchTerm", (req,res) => {
// 	Post.search(req.params.searchTerm).then((posts)=>{
// 		res.send(posts)
// 	},(error)=>{

// 	})
// })


router.post("/comments", (req,res) => {
	Post.get(req.body.id).then((post)=>{
		res.send(post.comment)
	},(error)=>{

	})
})

router.get("/delete/:id", (req,res) => {

	Post.delete(req.params.id).then((result)=>{
		res.send(result)
	},(error)=>{
		res.send(null)
	})
})

router.post("/deletepost", (req, res) =>{

	// Deletes post in the Post collection Db given the postID
	Post.deletePost(req.body.id).then((result)=>{ 
	//	res.send(result)
	},(error)=>{
		res.send(null)
	})

	// Deletes post in the User collection db by searchin for the user then deleting the post in his post array
	User.deletePost(req.body.username, req.body.id).then((result)=>{ 
		res.send(result) // only sends this one back since the ajax call updates the user profile only with his posts
	},(error)=>{
		res.send(null)
	})

})

router.post("/deletecomment", (req, res) =>{

	// Deletes comment in the Post collection Db given the postID
	Post.deleteComment(req.body.postID, req.body.commentID).then((result)=>{ 
	//	res.send(result)
	},(error)=>{
		res.send(null)
	})
	
	 Comment.deleteComment(req.body.commentID).then((result)=>{ 
		//	res.send(result) 
	 },(error)=>{
		res.send(null)
	 })

	// Deletes comment in the User collection db by searching for the user then deleting the post in his post array
	 User.deleteComment(req.body.username, req.body.postID, req.body.commentID).then((result)=>{ 
	 	res.send(result) // only sends this one back since the ajax call updates the user profile only with his posts
	 },(error)=>{
		res.send(null)
	 })
})

router.post("/updateComment", (req, res) =>{

	
	// Deletes comment in the Post collection Db given the postID
	Post.updateComment(req.body.postID, req.body.commentID, req.body.commentContent).then((result)=>{ 
	//	res.send(result)
	},(error)=>{
		res.send(null)
	})
	
	 Comment.updateComment(req.body.commentID, req.body.commentContent).then((result)=>{ 
		//	res.send(result) 
	 },(error)=>{
		res.send(null)
	 })

	// Deletes comment in the User collection db by searching for the user then deleting the post in his post array
	 User.updateComment(req.body.username, req.body.postID, req.body.commentID, req.body.commentContent).then((result)=>{ 
	 	res.send(result) // only sends this one back since the ajax call updates the user profile only with his posts
	 },(error)=>{
		res.send(null)
	 })



})

router.get("/:id", (req,res) => {
	Post.get(req.params.id).then((post)=>{
		res.render("./pages/post", {
			uname: req.session.username,
			postID: post._id,
			postTitle: post.postTitle,
			postDescription: post.postDescription,
			postAuthor: post.postAuthor,
			postScore: post.postScore,
			postDate: prettyMs(new Date() - post.postDate),
			commentNumber: post.commentNumber
		})
	},(error)=>{

	})
})

module.exports = router