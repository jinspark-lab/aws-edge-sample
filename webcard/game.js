var cards = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
var suits = ["diamonds", "hearts", "spades", "clubs"];
let values = ['Ace', 'King', 'Queen', 'Jack', 'Ten', 'Nine', 'Eight', 'Seven', 'Six', 'Five', 'Four', 'Three', 'Two', 'One'];

let gameManager = {
    gameStart: false,
    gameOver: false,
    playWon: '',
    playTurn: '',
    players: {
    },
    deck: []
};

module.exports.gameInit = function () {
    gameManager = {
        gameStart: false,
        gameOver: false,
        playWon: '',
        playTurn: '',
        players: {
        },
        deck: []
    }
    return gameManager;
}

module.exports.acceptPlayer = function (clientId) {
    console.log("Accept New Player, clientId=" + clientId);

    gameManager.players['' + clientId] = {
        cards: [],                  //Deck
        score: 0,                   //Score
        over: false                 //If player decides STAY, it will be true
    };
    console.log("Current Player : " + Object.keys(gameManager.players));
    if (Object.keys(gameManager.players).length >= 2) {
        return true;
    } else {
        return false;
    }
};

module.exports.createNewGame = function () {
    console.log("Create New Game");
    
    gameManager.gameStart = true;
    gameManager.gameOver = false;
    gameManager.playWon = '';

    gameManager.deck = createDeck();
    shuffleDeck(gameManager.deck);

    var aId = '';
    var bId = '';
    for (const playerId in gameManager.players) {
        gameManager.players['' + playerId].cards = [getNextCard(), getNextCard()];
        gameManager.players['' + playerId].score = getScore(gameManager.players['' + playerId].cards);
        if (aId === '') {
            aId = playerId;
        } else {
            bId = playerId;
        }
    }
    gameManager.players['' + aId].opponent = bId;
    gameManager.players['' + bId].opponent = aId;
    gameManager.playTurn = aId;

    return gameManager;
};

module.exports.submitHit = function (clientId) {
    //히트 로직
    gameManager.players['' + clientId].cards.push(getNextCard());

    //스코어링
    updateScores(clientId);
    if (gameManager.players['' + clientId].score >= 21) {
        gameManager.players['' + clientId].over = true;
    }
    //

    //게임 종료 검증
    if (!checkAndUpdateGameEnd()) {
        gameManager.playTurn = gameManager.players['' + clientId].opponent;
    } else {
        console.log("Game is over");
    }

    return gameManager;
}

module.exports.submitStay = function (clientId) {
    //턴 종료
    gameManager.players['' + clientId].over = true;

    //게임 종료 검증
    if (!checkAndUpdateGameEnd()) {
        gameManager.playTurn = gameManager.players['' + clientId].opponent;
    } else {
        console.log("Game is over");
    }

    return gameManager;
}

function createDeck() {
    let deck = []
    for (let suitIdx = 0; suitIdx < suits.length; suitIdx++) {
        for (let valueIdx = 0; valueIdx < values.length; valueIdx++) {
            let card = {
                suit: suits[suitIdx],
                value: values[valueIdx]
            }
            deck.push(card);
        }
    }
    return deck;
}

function shuffleDeck(deck) {
    for (let i = 0; i < deck.length; i++) {
        let swapIdx = Math.trunc(Math.random() * deck.length);
        let tmp = deck[swapIdx];
        deck[swapIdx] = deck[i];
        deck[i] = tmp;
    }
}

function getCardNumericValue(card) {
    switch (card.value) {
        case 'Ace': return 1;
        case 'Two': return 2;
        case 'Three': return 3;
        case 'Four': return 4;
        case 'Five': return 5;
        case 'Six': return 6;
        case 'Seven': return 7;
        case 'Eight': return 8;
        case 'Nine': return 9;
        default: return 10;
    }
}

function getScore(cardArray) {
    let score = 0;
    let hasAce = false;
    for (let i = 0; i < cardArray.length; i++) {
        let card = cardArray[i];
        score += getCardNumericValue(card);
        if (card.value == 'Ace') {
            hasAce = true;
        }

        if (hasAce && score + 10 <= 21) {
            return score + 10;
        }
    }
    return score;
}

/**
 * Update Score for players
 */
function updateScores(clientId) {
    gameManager.players['' + clientId].score = getScore(gameManager.players['' + clientId].cards);
}

/**
 * Check whether game is ended, and update the game winner
 */
function checkAndUpdateGameEnd() {
    var flag = true;
    for (const playerId in gameManager.players) {
        flag = (flag && gameManager.players['' + playerId].over);
    }
    console.log("Game End Flag : " + flag);

    if (flag) {
        var winner = '';
        var winValue = 99;
        for (const playerId in gameManager.players) {
            if (Math.abs(gameManager.players['' + playerId].score - 21) < winValue) {
                winner = playerId;
                winValue = Math.abs(gameManager.players['' + playerId].score - 21);
            }
        }
        gameManager.gameOver = true;
        gameManager.playWon = winner;
        return true;
    }
    return false;
}

/**
 * Get Next Card from deck
 * @returns 
 */
function getNextCard() {
    return gameManager.deck.shift();
}

// window.onload = load;
