const builder = require("botbuilder");
const utils = require('../utils/utils.js');
const Client = require("node-rest-client").Client;

var client = new Client();
var server;
var c;
var bot;

function start_listening() {
	this.server.post('api/bot', this.c.listen());

	/*
		Listen for bot dialog messages
	*/
	this.bot.dialog('/', (session) => {

		var text = utils.getTextWithoutMentions(session.message); // Make sure you strip mentions out before you parse the message

		var split = text.split(' ');

		if (split.length < 2) {
			sendHelpMessage(session.message, this.bot, `I'm sorry, I did not understand you :( `);
			return;
		}

		var q = split.slice(1);

		// Parse the command and go do the right thing
		if (split[0].includes('create') || split[0].includes('find')) sendTaskMessage(session.message, this.bot, q.join(' '));
		else if (split[0].includes('link')) createDeepLink(session.message, this.bot, q.join(' '));
		else {
			sendHelpMessage(session.message, this.bot, `I'm sorry, I did not understand you :( `);
			return;
		}

	});

	// When a bot is added or removed we get an event here. Event type we are looking for is teamMember added
	
	// This does not work at the moment. If we listen for this event, then bot.dialog above does not fire 
	/*
	this.c.onEvent((msgs) => {
		console.log('Received event');

		var msg = msgs[0]; // Ideally you'd loop through messages here to make sure we don't miss one...
		if (!msg.eventType === 'teamMemberAdded') return;
		if (!Array.isArray(msg.membersAdded) || msg.membersAdded.length < 1) return;
		var members = msg.membersAdded;

		// Loop through all members that were just added to the team
		for (var i = 0; i < members.length; i++) {

			// See if the member added was our bot
			if (members[i].id.includes('e68061f5-239f-4768-8ed9-ebe804d572d3') || members[i].id.includes('d812b620-006e-406a-99e4-93d670f91748')) {
				console.log('Bot added to team');
				sendHelpMessage(msg, this.bot, `Hi, I'm teamstodobot!!`);
			}
		}
	});
	*/
}

function createDeepLink(message, bot, tabName) {

	var name = tabName;
	var teamId = message.sourceEvent.teamsTeamId;
	var channelId = message.sourceEvent.teamsChannelId;

	var appId = '5bebb729-cf47-4937-b4b2-8f9b818d9655'; // This is the app ID you set up in your manifest.json file.
	var entity = `todotab-${name}-${teamId}-${channelId}`; // Match the entity ID we setup when configuring the tab
	var context = {
		channelId: channelId,
		canvasUrl: 'https://teams.microsoft.com'
	};

	var url = `https://teams.microsoft.com/l/entity/${encodeURIComponent(appId)}/${encodeURIComponent(entity)}?label=${encodeURIComponent(name)}&context=${encodeURIComponent(JSON.stringify(context))}`;

	var text = `Here's your [deeplink](${url}): \n`;
	text += `\`${decodeURIComponent(url)}\``;

	sendMessage(message, bot, text);
}

function sendTaskMessage(message, bot, taskTitle) {
	var task = utils.createTask();

	task.title = taskTitle;

	var text = `Here's your task: \n\n`;
	text += `---\n\n`;
	text += `**Task Title:** ${task.title}\n\n`;
	text += `**Task ID:** ${10}\n\n`;
	text += `**Task Description:** ${task.description}\n\n`;
	text += `**Assigned To:** ${task.assigned}\n\n`;

	sendMessage(message, bot, text);
}

function sendMessage(message, bot, text) {
	var msg = new builder.Message()
		.address(message.address)
		.textFormat(builder.TextFormat.markdown)
		.text(text);

	bot.send(msg, function(err) {});
}

function sendHelpMessage(message, bot, firstLine) {
	sendMessage(message, bot, createHelpMessage(firstLine));
}

function createHelpMessage(firstLine) {
	var text = `##${firstLine} \n\n Here's what I can help you do \n\n`
	text += `---\n\n`;
	text += `* To create a new task, you can type **create** followed by the task name\n\n`
	text += `* To find an existing task, you can type **find** followed by the task name\n\n`
	text += `* To create a deep link, you can type **link** followed by the tab name`;

	return text;
}


module.exports.init = function(server, connector, bot) {
	this.server = server;
	this.c = connector;
	this.bot = bot;
	return this;
}

module.exports.start_listening = start_listening;