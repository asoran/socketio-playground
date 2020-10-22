// initialize http server, socket.io and port number
const http = require('http').createServer(handler);
const io = require('socket.io')(http);
const fs = require('fs');
require('dotenv').config();

const log = console.log;
const PORT = process.env.PORT;

function handler(req, res) {
	res.writeHead(200);
	res.end(fs.readFileSync('index.html'));
};

http.listen(PORT, () => log(`Server listening on port: ${PORT}`));

const rooms = {};
const WIDTH = 100;
const HEIGHT = 25;
const PEPS_PER_COL = 5;

class People {
	name;
	id;
	x;
	y;
	constructor(name, id, x, y) {
		this.name = name;
		this.id = id;
		this.x = x;
		this.y = y;
	}
}

class Room {
	name;
	peoples;
	uid;
	constructor(name, peoples) {
		this.name = name;
		let h = 0;
		this.peoples = peoples.map((p, i) => {
			const r = i % PEPS_PER_COL;
			if (r == 0 && i != 0) { h++ };
			return new People(p, i, r * WIDTH + 10 * r, h * HEIGHT + 10 * h)
		});
		this.uid = peoples.length;
	}
}

io.on('connection', (socket) => {
	log('connected');

	socket.on('poll', (id) => {
		log(id)
		socket.emit('poll', rooms[id]);
		//socket.broadcast.emit('message', evt);
	});
	socket.on('create', ({ peoples, name }) => {
		log(name, peoples);
		rooms[name] = new Room(name, peoples);
		socket.emit('poll', rooms[name]);
	});
	socket.on('change', ({ name, id, x, y }) => {
		// log(name, id, x, y);
		const p = rooms[name].peoples.find(p => p.id == id);
		p.x = x;
		p.y = y;
		io.emit('change', { name, id, x, y });
	});
});
