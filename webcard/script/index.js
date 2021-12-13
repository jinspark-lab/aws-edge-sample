// const { Socket } = require("dgram");
var cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var suits = ["diamonds", "hearts", "spades", "clubs"];
let values = ['Ace', 'King', 'Queen', 'Jack', 'Ten', 'Nine', 'Eight', 'Seven', 'Six', 'Five', 'Four', 'Three', 'Two', 'One'];

let opponentText = document.getElementById('opponent-text');
let playerText = document.getElementById('player-text');
let hitButton = document.getElementById('hit-button');
let stayButton = document.getElementById('stay-button');
let gameText = document.getElementById('game-text');

hitButton.style.visibility = 'hidden';
stayButton.style.visibility = 'hidden';

let gamePlayerId = "";

function renderDeck(area, deck) {
    // document.getElementById('deck').innerHTML = '';
    document.getElementById(area).innerHTML = '';
    for (var i = 0; i < deck.length; i++) {
        var card = document.createElement("div");
        var value = document.createElement("div");
        var suit = document.createElement("div");
        card.className = "card";
        value.className = "value";
        suit.className = "suit " + deck[i].suit;

        value.innerHTML = deck[i].value;
        card.appendChild(value);
        card.appendChild(suit);

        document.getElementById(area).appendChild(card);
    }
}

function updatePlayStatus(status) {
    if (!status.gameStart) {
        gameText.innerText = 'Welcome to Blackjack!';
        return;
    }

    var opponentPlayer = status.players[status.players['' + gamePlayerId].opponent];
    var myPlayer = status.players['' + gamePlayerId];

    renderDeck('opponent-deck', opponentPlayer.cards);
    renderDeck('player-deck', myPlayer.cards);

    opponentText.innerText = 'opponent Score : ' + opponentPlayer.score + "\n\n";
    playerText.innerText = 'Player Score : ' + myPlayer.score + "\n\n";
}

function updateTurnStatus(status) {
    // TODO: 턴 상태에 따라 UI 및 상태값을 제어
    if (status.gameOver) {
        if (status.playWon === gamePlayerId) {
            gameText.innerText = "YOU WIN!";
        } else {
            gameText.innerText = "OPPONENT WINS";
        }
        // newGameButton.style.display = 'inline';
        hitButton.style.visibility = 'hidden';
        stayButton.style.visibility = 'hidden';
    } else {
        if (status.playTurn === gamePlayerId) {
            setPlayUI();
        } else {
            setWaitingUI();
        }
    }
}

function setPlayUI() {
    hitButton.style.visibility = 'visible';
    stayButton.style.visibility = 'visible';
    gameText.innerText = 'Playing my turn';
}

function setWaitingUI() {
    hitButton.style.visibility = 'hidden';
    stayButton.style.visibility = 'hidden';
    gameText.innerText = 'Waiting my turn';
}

function getMyPlayerData(data) {
    return data.players['' + gamePlayerId];
}

function getOpponentPlayerData(data) {
    return data.players[data.players['' + gamePlayerId].opponent];
}

// window.onload = load;

$(function () {
    // socket.io 서버에 접속한다
    var socket = io();

    gamePlayerId = makeRandomName();
    console.log("MyId : " + gamePlayerId);

    // 서버로 자신의 정보를 전송한다.
    socket.emit("login", {
        name: gamePlayerId,
        userid: "jinspark@amazon.com"
    });

    // 서버로부터의 메시지가 수신되면
    socket.on("login", function (data) {
        
        // TODO: 여기서 서버의 로그인 응답에 대한 클라이언트 작업을 처리
        console.log("On Login");
        console.log(data);

        var opponentPlayer = getOpponentPlayerData(data);
        var myPlayer = getMyPlayerData(data);

        console.log((data.playTurn === gamePlayerId));

        if (data.playTurn === gamePlayerId) {
            setPlayUI();
        } else {
            setWaitingUI();
        }
        
        renderDeck('opponent-deck', opponentPlayer.cards);
        renderDeck('player-deck', myPlayer.cards);

        opponentText.innerText = 'opponent Score : ' + opponentPlayer.score + "\n\n";
        playerText.innerText = 'Player Score : ' + myPlayer.score + "\n\n";
    });

    // 서버로부터의 메시지가 수신되면
    socket.on("chat", function (data) {
        $("#chatLogs").append("<div>" + data.msg + " : from <strong>" + data.from.name + "</strong></div>");
    });

    // 서버로부터의 Hit 메시지가 수신되면
    socket.on("serverHit", function (data) {

        console.log("On Server Hit");
        console.log(data);

        //
        updatePlayStatus(data);
        updateTurnStatus(data);
        // setWaitingUI();
    });

    // 서버로부터의 Stay 메시지가 수신되면
    socket.on("serverStay", function (data) {

        console.log("On Server Stay");
        console.log(data);

        //
        updatePlayStatus(data);
        updateTurnStatus(data);
        // setWaitingUI();
    });

    socket.on("serverClose", function (data) {
        updatePlayStatus(data);
        updateTurnStatus(data);
        socket.close();
    });

    hitButton.addEventListener('click', function () {

        var msgData = {
            clientId: gamePlayerId
        };

        // 클라이언트는 Emit 한 시점에 동작을 마치고 나머지는 서버의 응답을 받아서 업데이트해야함
        socket.emit("hit", { msg: msgData });

        // playerCards.push(getNextCard());
        // checkForEndOfGame();
        // updatePlayStatus();
        // setWaitingUI();
    });
    
    stayButton.addEventListener('click', function () {

        var msgData = {
            clientId: gamePlayerId
        };

        socket.emit("stay", { msg: msgData });
        // gameOver = true;
        // checkForEndOfGame();
        // updatePlayStatus();
        // setWaitingUI();
    });

    function makeRandomName() {
        var name = "";
        var possible = "abcdefghijklmnopqrstuvwxyz";
        for (var i = 0; i < 8; i++) {
            name += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return name;
    }
});