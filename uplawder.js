var formidable = require('formidable');

exports = module.exports = function uplawder(options) {
	

	return function (req,res,next) {
		if(req.method == 'GET' || req.method == 'HEAD') return next();
		
		//please be a form
		//
		var form = new formidable.IncomingForm;
		Object.keys(options).forEach(function(key){
			form[key] = options[key];
		});

		form.onPart = function (part) {
			
			req.fileStream = part;
			next();
		};

		form.parse(req);
	}
}
