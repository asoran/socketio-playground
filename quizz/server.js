// initialize http server, socket.io and port number
const http = require('http').createServer(handler);
const io = require('socket.io')(http);
const fs = require('fs');
require('dotenv').config();

const log = console.log;
const PORT = process.env.PORT;

function handler(req, res) {
	// console.log(req.url);
	res.writeHead(200);
	if ((req.url || null) == '/socket.io.js') {
		res.end(fs.readFileSync('socket.io.js'));
	} else {
		res.end(fs.readFileSync('index.html'));
	}
};

http.listen(PORT, () => log(`Server listening on port: ${PORT}`));

const answers = {};

class Answer {
	user;
	anime;
	op;
	titre;
	artist;
	constructor(user, anime, op, titre, artist) {
		this.user = user;
		this.anime = anime;
		this.op = op;
		this.titre = titre;
		this.artist = artist;
	}
}

io.on('connection', (socket) => {
	log('connected');

	socket.on('play', (name) => {
		console.log('new player', name);
		answers[name] = new Array();
		io.emit('new_player', name);
	});

	socket.on('i_am_admin', () => {
		socket.emit('i_am_admin', answers);
	});

	socket.on('answer', (answer) => {
		// console.log(answer);
		answers[answer.user].push(answer);
		io.emit('answer_admin', answer);
	});
});
