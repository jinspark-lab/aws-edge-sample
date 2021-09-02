
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();

app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
app.use(cookieParser());

//Memory Session
app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized: true,
	cookie: {
		maxAge: 5 * 60 * 1000
	}
}));
//

match = [];
games = {};
var gameId = 0;

app.get('/', function (req, res) {
	if (req.session.user) {

	} else {
		req.session.user = {
			id: Date.now(),
			authorized: true
		}
	}
	res.sendFile(__dirname + "/views/index.html");
});

app.get('/match', function (req, res) {
	if (req.session.user) {
		console.log('Matchmaker Called - req :' + req);

		var playerId = req.session.user.id;
		match.push(playerId);

		if (match.length % 2 == 0) {
			for (var player in match) {
				games[match[player]] = gameId;
			}
			gameId++;
			match = [];
		}
		res.sendStatus(200);
	} else {
		res.redirect('/');
	}
});

app.get('/status', function (req, res) {
	if (req.session.user) {
		// console.log("Players---");
		// console.log(players);
		console.log("Games---");
		console.log(games);
		console.log("User ID");
		console.log(req.session.user.id);
		if (req.session.user.id in games) {
			res.json({ ip: '127.0.0.1', port: 3000 });
		} else {
			res.json({ });
		}
	} else {
		res.redirect('/');
	}
});

var server = app.listen(80, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Server is working : Host-' + host + ', PORT-', port);
});
