const builder = require("botbuilder");
const uuid = require('node-uuid');
const rest = require('restler');
const starwars = require('starwars');
const utils = require('../utils/utils.js');

var server;
var access_token = null;
var rest_endpoint = null;
var tenant_id = null;
var connectors = {};

var appID = (process.env.ENVIROMENT === 'local') ? '[local app id]' : '8aefbb70-ff9e-409f-acea-986b61e51cd3';
var appPassword = (process.env.ENVIROMENT === 'local') ? '[local app id]' : 'hoCDLUcGnab6KqKa3tkvpxJ';
var host = (process.env.ENVIROMENT === 'local') ? 'http://localhost:3998/' : 'http://teamsnodesample.azurewebsites.net/';

var c = new builder.ChatConnector({
	appId: appID,
	appPassword: appPassword
});

var bot = new builder.UniversalBot(c);
var addresses = {}; // Place to save bot connections

/*
	Convenience method for connecting to the bot framework REST API.
	Note that this endpoint requires data in the multipart/form format
	This method returns a promise with the bearer token to make subsequent REST API calls
*/
function connectToRestAPI() {
	return new Promise((resolve, reject) => {

		var endpoint = 'https://login.microsoftonline.com/botframework.com/oauth2/v2.0/token';

		if (access_token !== null) resolve();

		rest.post(endpoint, {
			multipart: true,
			data: {
				'client_id': appID,
				'client_secret': appPassword,
				'scope': 'https://api.botframework.com/.default',
				'grant_type': 'client_credentials'
			}
		}).on('complete', (data) => {
			access_token = data.access_token;
			resolve();
		}).on('fail', (err) => {
			console.log('Cannot connect to rest api: ' + err);
			reject();
		});
	});
}

/*
	This is a convenience method to get all members in a channel using the REST API

	msg: a message of type IIs Message: https://docs.botframework.com/en-us/node/builder/chat-reference/classes/_botbuilder_d_.message.html

	returns a promise with a json object with:
		msg: the message that was passed in
		members: an array of members. Each member is a json object with an id property

	Notes:
		- the rest enpoint URL is contained in the msg as the serviceURL
		- conversation id is the full id returned in a message looks like 29:[someid]@skype....
*/
function getMembers(msg) {

	var conversationId = msg.address.conversation.id;

	return new Promise((resolve, reject) => {
		connectToRestAPI().then(() => {
			var endpoint = `${rest_endpoint}v3/conversations/${conversationId}/members`;
			rest.get(endpoint, {
				'headers': {
					'Authorization': 'Bearer ' + access_token
				}
			}).on('complete', (data) => {
				console.log('Getting members');

				resolve({
					msg: msg,
					members: data
				});
			}).on('fail', (err) => {
				console.log('Cannot get members: ' + err);
				reject(err);
			});
		}, (err) => {
			console.log("Get Members failed");
			reject(err);
		});

	});
}

/*
	This is a convenience method to start a conversation using the rest API
	
	user: the user to which a message should be sent
	callback: a function to which we pass the conversation object when done. The conversation object is a javascript object with an id


	Notes:
		- the rest enpoint URL is contained in the msg as the serviceURL
		- Note that channelData is required, but only the tenant id part if a message is being sent to a user
		- If a message is being sent to a channel then the team id also needs to be part of channel data
*/
function startConversation(user, callback) {

	console.log('Trying Starting Conversation');
	var endpoint = `${rest_endpoint}v3/conversations`;

	var data = {
		"bot": {
			"id": "28:" + appID,
			"name": "luislocalnotify"
		},
		"members": [{
			"id": user
		}],
		"channelData": {
			"tenant": {
				"id": tenant_id
			}
		}
	};

	rest.post(endpoint, {
		'headers': {
			'Authorization': 'Bearer ' + access_token
		},
		'data': JSON.stringify(data)
	}).on('complete', function(data) {
		console.log('Starting Conversation');
		callback(data);
	});
}

function start_listening() {

	// TODO: Figure out how to register this to teams and not to emails
	this.server.get('api/messages/connector/register', (req, res) => {
		var query = req.query;

		var webhook_url = query.webhook_url;
		var group_name = query.group_name;

		if (connectors.length > 100) connectors = {}; //Clean up to not blow up memory on my server :)

		connectors[group_name] = webhook_url;

		res.send(webhook_url);

		rest.postJson(webhook_url, {
			
				text: `A connector for the group ${group_name} has been setup!`
			
		}).on('complete', function(data, response) {
			console.log('completed connector setup');
			res.end();
		});
	});

	// This endpoint allows for sending connector messages. It checks if a webhook URL has been passed in first (set up as an incoming webhook)
	// if not it checks if a connector has been registered with us
	this.server.get('api/messages/connector/send', (req, res) => {
		var group_name = (typeof req.params.group_name === 'string') ? req.params.group_name : '';
		var type = (typeof req.params.type === 'string') ? req.params.type : 'static';
		var webhook_url = (typeof req.params.webhook_url === 'string') ? req.params.webhook_url : null;
		webhook_url = (webhook_url == null) ? ((connectors[group_name]) ? connectors[group_name] : null) : webhook_url;

		if (!webhook_url){
			res.send(`A connector for ${group_name} has not been setup`);
			res.end();
		}

		// TODO: Generate actionable cards
		var actions = [
			{name:'Send Static Card', target:`${host}api/messages/connector/send?webhook_url=${webhook_url}&type=static`},
			{name:'Send Actionable Card', target:`${host}api/messages/connector/send?webhook_url=${webhook_url}&type=actionable`},
			{name:'Microsoft.com', target:`https://www.microsoft.com`}
		];

		var message = utils.generateConnectorCard(actions);
		res.send(webhook_url);		

		rest.postJson(webhook_url, message).on('complete', function(data, response) {
			console.log('completed connector request');
			res.end();
		});

	});

	// Endpoint to send one way messages
	this.server.get('api/messages/send/team', (req, res) => {

		var address = addresses[decodeURIComponent(req.params.id)];
		var type = (typeof req.params.type === 'string') ? req.params.type : 'text';

		if (!address) {
			res.send('Sorry cannot find your bot, please re-add the app');
			res.end();
			return;
		}

		console.log('Sending Message to team');

		try {

			var starwars_quote = starwars();
			var msg = new builder.Message().address(address);

			if (type === 'text') msg.text(starwars_quote);
			if (type === 'hero') msg.addAttachment(utils.createHeroCard(builder));
			if (type === 'thumb') msg.addAttachment(utils.createThumbnailCard(builder));

			if (type === 'text') res.send('Look on MS Teams, just sent: ' + starwars_quote);
			if (type === 'hero') res.send('Look on MS Teams, just sent a Hero card');
			if (type === 'thumb') res.send('Look on MS Teams, just sent a Thumbnail card');

			bot.send(msg, function(err) {
				// Return success/failure
				res.status(err ? 500 : 200);
				res.end();
			});
		} catch (e) {}
	});

	// Endpoint to send one way messages
	this.server.get('api/messages/send/user', (req, res) => {

		var address = addresses[decodeURIComponent(req.params.id)];
		var user = decodeURIComponent(req.params.user);
		var type = (typeof req.params.type === 'string') ? req.params.type : 'text';

		if (!address) {
			res.send('Sorry cannot find your bot, please re-add the app');
			res.end();
			return;
		}

		if (!user) {
			res.send('Sorry cannot find your user, please re-add the app');
			res.end();
			return;
		}

		console.log('Sending Message to user');

		try {

			startConversation(user, function(data) {

				var newConversationId = data.id;

				address.conversation.id = newConversationId;

				var starwars_quote = starwars();
				var msg = new builder.Message().address(address)

				if (type === 'text') msg.text(starwars_quote);
				if (type === 'hero') msg.addAttachment(utils.createHeroCard(builder));
				if (type === 'thumb') msg.addAttachment(utils.createThumbnailCard(builder));

				if (type === 'text') res.send('Look on MS Teams, just sent: ' + starwars_quote);
				if (type === 'hero') res.send('Look on MS Teams, just sent a Hero card');
				if (type === 'thumb') res.send('Look on MS Teams, just sent a Thumbnail card');

				bot.send(msg, function(err) {
					// Return success/failure
					res.status(err ? 500 : 200);
					res.end();
				});
			});
		} catch (e) {}
	});

	this.server.post('api/messages', c.listen()); // bind our one way bot to /api/messages

	// When a bot is added or removed we get an event here. Event type we are looking for is teamMember added
	c.onEvent((msgs) => {

		console.log('Received event');

		var msg = msgs[0]; // Ideally you'd loop through messages here to make sure we don't miss one...

		if (!rest_endpoint) rest_endpoint = msg.address.serviceUrl; // This is the base URL where we will send REST API request
		if (!tenant_id) tenant_id = msg.sourceEvent.tenant.id; // Extracting tenant ID as we will need it to create new conversations
		if (!msg.eventType === 'teamMemberAdded') return;

		if (!Array.isArray(msg.membersAdded) || msg.membersAdded.length < 1) return;

		var members = msg.membersAdded;

		// We are keeping track of unique addresses so we can send messages to multiple users and channels at the same time
		// Clean up so we don't blow up memory (I know, I know, but still)
		if (addresses.length > 100) addresses = {};

		// Loop through all members that were just added to the team
		for (var i = 0; i < members.length; i++) {

			// See if the member added was our bot
			if (members[i].id.includes('8aefbb70-ff9e-409f-acea-986b61e51cd3') || members[i].id.includes('150d0c56-1423-4e6d-80d3-afce6cc8bace')) {

				console.log('Bot added to team');

				// Find all members currently in the team so we can send them a welcome message
				getMembers(msg).then((ret) => {

					var msg = ret.msg;
					var members = ret.members;

					console.log('got members');

					// Prepare a message to the channel about the addition of this app. Write convenience URLs so 
					// we can easily send messages to the channel and individually to any user
					var guid = uuid.v4();
					var text = `##Just added the To Do App!! \n Send message to channel: `
					text += `[Text](${host}api/messages/send/team?id=${encodeURIComponent(guid)})`;
					text += ` | [Hero Card](${host}api/messages/send/team?type=hero&id=${encodeURIComponent(guid)})`;
					text += ` | [Thumbnail Card](${host}api/messages/send/team?type=thumb&id=${encodeURIComponent(guid)})`;
					addresses[guid] = msg.address;

					// Loop through and prepare convenience URLs for each user
					text += '\n\n';
					for (var i = 0; i < members.length; i++) {
						var user = members[i].id;
						guid = uuid.v4();

						text += `Send message to user number ${i+1}: `
						text += `[Text](${host}api/messages/send/user?id=${encodeURIComponent(guid)}&user=${encodeURIComponent(user)})`;
						text += ` | [Hero Card](${host}api/messages/send/user?type=hero&id=${encodeURIComponent(guid)}&user=${encodeURIComponent(user)})`;
						text += ` | [Thumbnail Card](${host}api/messages/send/user?type=thumb&id=${encodeURIComponent(guid)}&user=${encodeURIComponent(user)})`;
						text += '\n\n';

						addresses[guid] = JSON.parse(JSON.stringify(msg.address)); // Make sure we mae a copy of an address to add to our addresses array
					}

					// Go ahead and send the message
					try {
						var msg = new builder.Message()
							.address(msg.address)
							.textFormat(builder.TextFormat.markdown)
							.text(text);

						bot.send(msg, function(err) {

						});
					} catch (e) {
						console.log(`Cannot send message: ${e}`);
					}

				}, (err) => {

				});

			}
		}
	});
}

module.exports.init = function(server) {
	this.server = server;
	return this;
}

module.exports.start_listening = start_listening;