$(function() {

var socket = io.connect();



var video = document.getElementsByTagName('video')[0];

socket.on('timer', function (data) {
	console.log(data);
	console.log($('#player'));
	//video.currentTime = parseFloat(data);
	video.currentTime = data;
	//video.pause();
	//setTimeout(function () { video.play() }, 4000);
	//setTimeout(function () { video.currentTime = 1; }, 10000);
});

socket.on('pause',function () {
	video.pause();
});

socket.on('paused?', function(paused) {
	if(paused)
		video.pause();
	else
		video.play();
});

socket.on('play', function (data) {
	video.play();
	video.currentTime = data;
});


$('#pause').click(function () { 
	socket.emit('pause');
});
$('#play').click(function () { 
	socket.emit('play');
});

});
