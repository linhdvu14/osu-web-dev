var express = require("express");
var mysql = require("./dbcon.js");

var app = express();
var handlebars = require("express-handlebars").create({defaultLayout:"main"});
var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine("handlebars", handlebars.engine);
app.set("view engine", "handlebars");
app.set("port", 3000);
app.use(express.static("public"));



// Define function to query database and send results to client
function sendQuery(req, res, next) {
	mysql.pool.query("SELECT id, name, reps, weight, DATE_FORMAT(date, '%Y-%m-%d') AS date, lbs FROM workouts", function(err, rows, fields){
		if(err){
			next(err);
			return;
    	}
    	res.send(JSON.stringify(rows));
  	});
}


// Reset database table
app.get("/reset-table",function(req, res, next){
	var context = {};	
	mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
		var createString = "CREATE TABLE workouts("+
							"id INT PRIMARY KEY AUTO_INCREMENT,"+
							"name VARCHAR(255) NOT NULL,"+
							"reps INT,"+
							"weight INT,"+
							"date DATE,"+
							"lbs BOOLEAN)";
		mysql.pool.query(createString, function(err){
	 		context.results = "Table reset";
	  		res.render("home",context);
		})
 	});
});



// Render main page
app.get("/", function(req, res, next){
	var context = {};
	res.render("interface", context);
});


// Query database, send results back
app.get("/select-all", function(req, res, next){
	sendQuery(req, res, next);
});


// Insert entry to database if name not blank, send back updated results
app.post("/insert", function(req, res, next){
	if (req.body.name) {
		mysql.pool.query("INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `lbs`) VALUES (?, ?, ?, ?, ?)", 
		[req.body.name, req.body.reps || null, req.body.weight || null, req.body.date || null, req.body.lbs || null], 
		function(err, result){
			if(err){
				next(err);
				return;
			}
			sendQuery(req, res, next);
		});		
	} else {
		console.log("Name field empty -- database unchanged.");
	}
});


// Delete indicated entry from database, send back updated results
app.post("/delete", function(req, res, next){
	mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.body.id], function(err, result){
		if(err){
			next(err);
			return;
		}
		sendQuery(req, res, next);
	});
});


// Redirect to Edit page
app.get("/edit", function(req, res, next){
	var context = {};
	mysql.pool.query("SELECT id, name, reps, weight, DATE_FORMAT(date, '%Y-%m-%d') AS date, lbs FROM workouts WHERE id=?", [req.query.id], function(err, rows, field){
		if(err){
			next(err);
			return;
		}
		context = rows[0];
		res.render("edit", context);
	});
});


// Update result, redirect to main page
app.post("/", function(req, res, next) {
	if (req.body["Submit Edit"]) {
		mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, lbs=? WHERE id=? ",
		[req.body.name, req.body.reps || null, req.body.weight || null, req.body.date || null, req.body.lbs || null, req.body.id], 
		function(err, results) {
			if(err) {
				next(err);
				return;
			}
			var context = {};
			res.render("interface", context);
		});
	}					
});



app.use(function(req,res){
  res.status(404);
  res.render("404");
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.status(500);
  res.render("500");
});

app.listen(app.get("port"), function(){
  console.log("Express started on http://localhost:" + app.get("port") + "; press Ctrl-C to terminate.");
});
