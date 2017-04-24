const restify = require("restify");
const fs = require('fs-extra');
const moment = require('moment');
const utils = require('../utils/utils.js');

var index = fs.readFileSync('./tabs/index.html', 'utf-8');
var about = fs.readFileSync('./tabs/about.html', 'utf-8');

var server;

function start_listening() {

	this.server.get('tabs/index', (req, res, next) => {
		sendFile('./tabs/index.html', res);
	});

	this.server.get('tabs/about', (req, res, next) => {
		sendFile('./tabs/about.html', res);
	});

	this.server.get('tabs/configure', (req, res, next) => {
		sendFile('./tabs/configure.html', res);
	});

	this.server.get('api/tasks/my', (req, res, next) => {

		var numdays = (typeof req.params.numdays === 'string') ? parseInt(req.params.numdays) : 5;

		var ret = [];
		for (var i = 0; i < numdays; i ++){
			
			var title = (i == 0) ? 'Today' : (i == 1) ? 'Tomorrow' : moment(new Date()).add(i,'days').format('dddd');

			var day = {
				'title': title,
				'tasks': []
			}

			var num_tasks = Math.floor(Math.random() * (10 - 2 + 1)) + 2;
			for (var j = 0; j < num_tasks; j++){
				day.tasks.push(utils.createTask());
			}

			ret.push(day);
		}

		res.send(ret);
		res.end();

	});

}

function sendFile(path, res){
	
	var data = fs.readFileSync(path, 'utf-8');
	res.writeHead(200, {
		'Content-Length': Buffer.byteLength(data),
  		'Content-Type': 'text/html'
	});

	res.write(data);
	res.end();
}

module.exports.init = function(server) {
	this.server = server;
	return this;
}

module.exports.start_listening = start_listening;