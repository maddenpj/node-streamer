var formidable = require('formidable');

exports = module.exports = function uplawder(options) {
	

	return function (req,res,next) {
		if(req.method == 'GET' || req.method == 'HEAD') return next();
		
		console.log(req.method);
		console.log(req.url);
		console.log(req.headers);

		/*
		var form = new formidable.IncomingForm;
		Object.keys(options).forEach(function(key){
			form[key] = options[key];
		});

		form.onPart = function (part) {
			
			req.fileStream = part;
			next();
		};

		form.parse(req);*/
	}
}
