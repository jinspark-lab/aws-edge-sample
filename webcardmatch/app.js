
const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
var AWS = require("aws-sdk");
var ec2 = new AWS.EC2({ region: 'us-east-1' });
var systemsmanager = new AWS.SSM({ region: 'us-east-1' });
var globalaccelerator = new AWS.GlobalAccelerator({ region: 'us-west-2' });

app.use(express.json());
app.use(express.urlencoded({
	extended: true
}));
app.use(cookieParser());

match = [];
games = {};
var gameId = 0;

var avialbleEndpoint = {};

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/views/index.html");
});

app.post('/match', function (req, res) {
	var playerId = req.header('playerid');
	match.push(playerId);

	findRoutePath();

	if (match.length % 2 == 0) {
		for (var player in match) {
			games[match[player]] = gameId;
		}
		gameId++;
		match = [];
	}
	res.sendStatus(200);
});

app.post('/status', function (req, res) {
	var playerId = req.header('playerid');

	if (playerId in games) {
		res.json(avialbleEndpoint);
	} else {
		res.json({ });
	}
});

var findRoutePath = function() {
	var parameter = {
		"Name": "webcardSubnetId"
	};
	systemsmanager.getParameter(parameter, function(err, data) {
		if (err) {
			console.log(err, err.stack);
		} else {
			searchAvailableEndpoint(data.Parameter.Value);
		}
	});
}

var searchAvailableEndpoint = function(subnetid) {
	var params = {
		Filters: [
			{
				Name: "subnet-id",
				Values: [
					subnetid
				]
			}
		]
	};
	ec2.describeInstances(params, function (err, data) {
		if (err) {
			console.log(err, err.stack);
		} else {
			var reservations = data.Reservations;
			var valids = [];

			//Find valid Ec2 instances
			for (var i in reservations) {
				var instances = reservations[i].Instances;
				for (var j in instances) {
					if (instances[j].State.Name == "running") {
						valids.push(instances[j].PrivateIpAddress);
					}
				}
			}

			//Get random valid instance
			var randAddress = Math.floor(Math.random() * valids.length);

			var agaParams = {
				EndpointId: subnetid,
				DestinationAddress: valids[randAddress]
			}
			globalaccelerator.listCustomRoutingPortMappingsByDestination(agaParams, function (err, data) {
				if (err) {
					console.log(err, err.stack);
				} else {
					console.log(data);
					var connectionInfo = {
						ip: data.DestinationPortMappings[0].AcceleratorSocketAddresses[0].IpAddress,
						port: data.DestinationPortMappings[0].AcceleratorSocketAddresses[0].Port
					}
					avialbleEndpoint = connectionInfo;
				}
			});
		}
	});
}

var server = app.listen(80, function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log('Server is working : Host-' + host + ', PORT-', port);
});
