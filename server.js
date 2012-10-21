var express = require('express'); 
var http = require('http');
var app = express(); 
var server = http.createServer(app);
var io  = require('socket.io').listen(server); 

server.listen(8080); // start listening on 8080
app.configure(function () {
	app.use(express.static(__dirname+'/public')); // I will statically server all files in public 
});
app.get('/', function (request, response) { // Route / -> index.html 
	response.sendfile(__dirname+'/index.html'); 
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
io.sockets.on('connection', function (socket) {
	clients.push(new Client(socket));

	socket.emit('timer', currentTimer);
	socket.emit('pause');

	socket.on('pause', function () {
		for(var i = 0; i < clients.length; i++) {
			clients[i].socket.emit('pause');
		}
		clearInterval(timerID);
		pause = true;
	});

	socket.on('play', function () {
		for(var i = 0; i < clients.length; i++) {
			clients[i].socket.emit('play',currentTimer);
		}
		timer();
		pause = false;
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
