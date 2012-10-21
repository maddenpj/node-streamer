$(function() {

var socket = io.connect();

var current = 0;
var chunk   = 2048;
var file = '';

function doSlice() {	
	var reader = new FileReader();
	
	var stop = current + chunk - 1;
	if(stop>(file.size-1)) stop = file.size-1;
	var corrected_length = (stop-current) +1;

	var blob = file.slice(current, current+corrected_length);

	reader.onloadend = function (event) {
		socket.emit('file-upload', window.btoa(event.target.result));
	};
	reader.readAsBinaryString(blob);
	console.log('sent: ' + current + ' / ' + file.size);
	
	current += chunk;
	
	if(current >= file.size) {
		console.log('Completed');
	}
	else {
		setTimeout(doSlice, 250);
	}
}

$('#file-submit').click(function () {
	var fileList = document.getElementById('file-input');
	file = fileList.files[0];
	doSlice();
});



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
