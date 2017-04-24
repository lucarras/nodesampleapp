const builder = require("botbuilder");
const faker = require('faker');

var c;
var bot;
var server;

function start_listening() {

	this.server.post('api/bot', this.c.listen());

	// Make sure to listen to the on invoke call. This is what triggers the input extension
	this.c.onInvoke((msg, callback) => {

		var v = msg.value;

		if (!v.commandId || !v.parameters) return;

		var results;

		if (v.commandId === "searchCmd") {
			results = generateResults();
		};

		callback(null, results, 200);

	});
}

function generateResults(){
	var results = {
		inputExtension:{
			attachmentLayout: 'list',
			type: 'result',			
		}
	}

	var attachments = [];
	for(var i = 0; i < 5; i++){
		attachments.push(generateResultAttachment());
	}

	results.inputExtension.attachments = attachments;
	return results;
}

function generateThumbnail(){
	return {
		contentType: 'application/vnd.microsoft.card.thumbnail',
		content: {
			title: faker.fake('{{commerce.productName}}'),
			subtitle: `Assigned to ${faker.fake('{{name.firstName}} {{name.lastName}}')}`,
			text: faker.fake('{{lorem.sentence}}'),
			images: [
				{
					url: `https://b7636f11.ngrok.io/static/img/image${Math.floor(Math.random() * (9 - 1 + 1)) + 1}.png`
				}
			]
		}
	}
}

function generateResultAttachment(){
	var attachment = generateThumbnail();
	attachment.preview = generateThumbnail();
	return attachment;
}

module.exports.init = function(server, connector, bot) {
	this.server = server;
	this.c = connector;
	this.b = bot;
	return this;
}

module.exports.start_listening = start_listening;