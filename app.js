const restify = require('restify');
const builder = require('botbuilder');

process.env.ENVIROMENT = 'cloud';

var server = restify.createServer();
server.use(restify.queryParser());

server.listen(process.env.port || process.env.PORT || 3998, () => {
	console.log(`Started ToDo App`);
});

server.get(/\/static\/?.*/, restify.serveStatic({
    directory: __dirname 
}));

var c = new builder.ChatConnector({ 
	appId: (process.env.ENVIROMENT === 'local') ? '[local app id]' : 'd812b620-006e-406a-99e4-93d670f91748', 
	appPassword: (process.env.ENVIROMENT === 'local') ? '[local app id]' : '664Zv3Q2GJe6DawSmeAHVfq'});
var b = new builder.UniversalBot(c);

var bot = require('./bot/bot.js');
bot.init(server, c, b);
bot.start_listening();

var input = require('./input/input.js');
input.init(server, c, b);
input.start_listening();


var notifications = require('./notifications/notifications.js');
notifications.init(server);
notifications.start_listening();

var tabs = require('./tabs/tabs.js');
tabs.init(server);
tabs.start_listening();
