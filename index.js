const express = require('express')
const cool = require('cool-ascii-faces')
const path = require('path')
const request = require('request')
const PORT = process.env.PORT || 5000

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.sendFile(path.join(__dirname, "index.html")))
    .get('/post', (req, res) => res.sendFile(path.join(__dirname, "post.html")))
    .get('/signin', (req, res) => res.sendFile(path.join(__dirname, "signin.html")))
    .get('/signedin', (req, res) => res.sendFile(path.join(__dirname, "signedin.html")))
    .get('/cool', (req, res) => res.sendFile(path.join(__dirname, "user-profile.html")))
    .get('/register', (req, res) => res.sendFile(path.join(__dirname, "register.html")))
    .get('/newpost', (req, res) => res.sendFile(path.join(__dirname, "newpost.html")))
    .get('/editpost', (req, res) => res.sendFile(path.join(__dirname, "editpost.html")))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`))