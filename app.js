var express = require("express");
var app = express();
var bodyParser = require("body-parser");
var MongoClient = require("mongodb").MongoClient;
var mongoUrl = "mongodb://liyang:liyang007@ds021016.mlab.com:21016/flipbroad";
var db;

app.set("view engine", "ejs");//模板渲染引擎设置为ejs

app.use(express.static(__dirname + '/public'));//????????????????????????????????????????????????????????

MongoClient.connect(mongoUrl, function(err, database) {
	if (err) return console.log("error : " + err);
	db = database;
	app.listen( process.env.PORT || 5050, function() {//??????????????????????????????????????????
		console.log("server started");
	});
});

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));

// where the app starts from user
app.get("/", function(req, res) {
	res.render("index");//主页入口
});
// router for create new category (with website name, url, and icon)
app.get("/category-create", function (req, res) {
	res.render("category-create");
});
// router to get all category list by UI view(readonly)
app.get("/category-index", function(req, res) {
	res.render("category-index");
});
// router for login with json support, and record those logs!
app.post("/login", function(req, res) {
	// retrieve current time 
	var now = (new Date()).toLocaleString();
	var store = { "user": req.body.user_name || "test", "time": now };
	// save to database
	db.collection("login").save(store, function(err, result) {		
		res.json({ "status" : "success", "user" : req.body.user_name || "test", "time": now });
	});
});
// router for save user behavior and resposne with relevant contents
app.post("/picker-save", function(req, res) {
	// save user behavior first 
	// oh, escape this due to lack of time :-(
	// then retreive related content with selected categories and send back thru json
	var cursor = db.collection("content").find({"$or":req.body.channelselect_id });//.sort({"_id": 1});
	cursor.toArray(function(err, results) {
		var output = {};
		output.feed = results;
		res.json(output);
	});
});

app.get("/homepage_no1",function(req,res) {
	var cursor = db.collection("homepage_content").find();
	cursor.toArray(function(err,results){
		var output = {};
		output.news = results;
		res.json(output);
	});
});
app.get("/homepage_no2",function(req,res) {
	var cursor = db.collection("homepage_channels").find();
	cursor.toArray(function(err,results){
		var output = {};
		output.channels = results;
		res.json(output);
	});
});
app.get("/homepage_no3",function(req,res) {
	var cursor = db.collection("homepage_search").find();
	cursor.toArray(function(err,results){
		var output = {};
		output.recommend = results;
		res.json(output);
	});
});
// router to get all category list by JSON
app.get("/category-list", function(req, res) {
	var cursor = db.collection("category").find();
	cursor.toArray(function(err, results) {
		var output = {};
		output.feed = results;
		res.json(output);
	});
})

// router to save category creation点击开始提交的数据存入数据库
/*
app.post("/category-save", function (req, res) {
	// init data object 
	var r = req.body, 
		l = r.site.length;
		s = {};

	s.catagory = r.catagory;
	s.site = [];

	// create site array [name, url, icon]
	for (var i=0; i < l ; i++) { 
		var o = {
			"name" : r.site[i],
			"url" : r.url[i],
			"icon" : r.icon[i]
		};
		s.site.push(o);
	};

	// restore in database
	db.collection("category").save(s, function(err, result) {
		if (err) return console.log(err);
		res.redirect("/category-index");
	});

});*/

// need to make sure mongo connectivity before opening web service
