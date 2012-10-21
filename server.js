var express = require('express'); 
var http = require('http');
var app = express(); 
var server = http.createServer(app);
var io  = require('socket.io').listen(server); 
var uplawder = require('./uplawder.js');
var atob  = require('atob');

server.listen(8080); // start listening on 8080

var debugf = require('fs').createWriteStream('vid.webm');

rooms = [];
roomID = 1;

app.configure(function () {
	app.use(express.static(__dirname+'/public'));
	//app.use(express.bodyParser({uploadDir: __dirname+'/uploads'}));
	app.use(uplawder({uploadDir: __dirname+'/uploads'}));
	app.set('views', __dirname+'/templates');
	app.set('view engine','jade');
	app.set('view options', {layout:false});
});
app.get('/', function (request, response) { 
	//response.sendfile(__dirname+'/index.html'); 
	response.render('index');
});

app.get('/getroom', function(req, res) {
	var id = roomID;
	roomID++; 
	rooms.push(id);
	res.redirect('/room/'+id);
});

app.get('/room/:id',function (req,res) {
	console.log(req.params.id);
	res.render('room', { roomName: req.params.id});
});

app.post('/room/:id', function (req,res) {
	console.log('Gotcha');
});

var DaStream='';
var DaData = new Buffer(0);

app.post('/upload/:id', function (req, res) {
	console.log('Uplawding');
	
	//res.end('Uploading');
	DaStream = req.fileStream;
	console.log(DaStream);
	DaStream.on('data', function(data) { 
		DaData = Buffer.concat([DaData,data]);
	});
	DaStream.on('end', function () {
		console.log('==== END ====');
	});
});

app.get('/stream/:id', function(req,res) {
	/*var total = DaData.length;
	if (req.headers['range']) {
		var range = req.headers.range;
		var parts = range.replace(/bytes=/, "").split("-");
		var partialstart = parts[0];
		var partialend = parts[1];

		var start = parseInt(partialstart, 10);
		var end = partialend ? parseInt(partialend, 10) : total-1;

		var chunksize = (end-start)+1;
		console.log('RANGE: ' + start + ' - ' + end + ' = ' + chunksize);

		var file = DaData.slice(start,end);
		res.writeHead(206, { 'Content-Range': 'bytes ' + start + '-' + end + '/' + total, 'Accept-Ranges': 'bytes', 'Content-Length': chunksize, 'Content-Type': DaStream.mime });
		res.end(file);
	} else {
		console.log('ALL: ' + total);
		res.writeHead(200, { 'Content-Length': total, 'Content-Type': DaStream.mime });
		res.end(DaData);
	}
	*/
});

function Client(socket)
{
	this.username = ''; // Unused 
	this.socket = socket;
}

clients = [];
posts = []; 


var currentTimer = 0;
var timerID = -1;
var paused = true;
function timer() {
	timerID = setInterval(function () {
		currentTimer += 1;
		console.log(currentTimer);
	},1000);
}
//timer(); 

// socket.io 
io.set('log level', 0);
io.sockets.on('connection', function (socket) {
	clients.push(new Client(socket));

	socket.emit('timer', currentTimer);
	socket.emit('paused?',paused);

	socket.on('pause', function () {
		for(var i = 0; i < clients.length; i++) {
			clients[i].socket.emit('pause');
		}
		clearInterval(timerID);
		paused = true;
	});

	socket.on('file-upload', function (data) {
		var dbuf = new Buffer(atob(data));
		debugf.write(dbuf);
	});

	socket.on('play', function () {
		for(var i = 0; i < clients.length; i++) {
			clients[i].socket.emit('play',currentTimer);
		}
		timer();
		paused = false;
	});
	// Remove client from Clients
	socket.on('disconnect', function () { 
		for( var i = 0; i < clients.length; i++)
		{
			if(socket == clients[i].socket)
			{
				console.log('Disconnecting: ' + clients.username);
				clients.splice(i,1);
				break;
			}
		}
	});
});
