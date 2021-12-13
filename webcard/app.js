
const express = require('express');
const session = require('express-session');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
const game = require('./game.js');

app.use('/script', express.static(__dirname + "/script"));
app.use('/style', express.static(__dirname + "/style"));

app.get('/', function (req, res) {
	res.sendFile(__dirname + "/views/index.html");
});

io.on('connection', function (socket) {
	// Triggered when socket has been connected.
    console.log("New connection in");

	socket.on('login', function (data) {
		console.log('Client logged-in:\n name:' + data.name + '\n userid: ' + data.userid);

		// socket에 클라이언트 정보를 저장한다
		socket.name = data.name;
		socket.userid = data.userid;
	
		// 로그인 한다고 바로 게임 시작하면 안됨. 두 플레이어가 모두 로그인 되었을 때 시작해야함
		if (game.acceptPlayer(data.name)) {
			// 새 게임 시작
			var status = game.createNewGame();
			// 접속된 모든 클라이언트에게 메시지를 전송한다
			io.emit('login', status );
		}
	});

    socket.on('hit', function (data) {
		var clientId = data.msg.clientId;
        console.log('Player[%s] Hit : %s', clientId, data.msg);	//Player[mxqbvvtw] Hit : { clientId: 'mxqbvvtw' }

		// 클라이언트에 대해 Hit 작업을 수행
		var status = game.submitHit(clientId);

        // 접속된 모든 클라이언트에게 메시지 전송
        io.emit('serverHit', status);
    });

    socket.on('stay', function (data) {
		var clientId = data.msg.clientId;
        console.log('Player[%s] Stay : %s', clientId, data.msg);

		// 클라이언트에 대해 Stay 작업을 수행
		var status = game.submitStay(clientId);

        // 접속된 모든 클라이언트에게 메시지 전송
        io.emit('serverStay', status);
    });

	socket.on('forceDisconnect', function () {
		console.log('User disconnected: ' + socket.name);
		var status = game.gameInit();
		io.emit('serverClose', status);
		socket.disconnect();
	});

	socket.on('disconnect', function () {
		console.log('User disconnected: ' + socket.name);
		var status = game.gameInit();
		io.emit('serverClose', status);
	});

});

server.listen(3000, function () {
	console.log('Socket IO server listening on port 3000');
});
