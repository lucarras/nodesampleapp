const faker = require('faker');

/*
	Convenience method to create a Hero card. Takes in an instance of BotBuilder and returns an attachment of type HeroCard
*/
module.exports.createHeroCard = function(builder) {
	return new builder.HeroCard()
		.title('This is a Hero Card')
		.subtitle('Card subtitle')
		.text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vehicula, risus ac placerat vestibulum, quam metus congue augue, sed placerat elit metus a odio. Suspendisse nec odio in elit bibendum mollis vel eu diam. Integer id mollis orci, sed iaculis nibh. Suspendisse venenatis lacus neque, quis semper arcu tempus sed. Nunc quam augue, pulvinar at eros ac, bibendum ornare metus. Phasellus vitae enim augue.')
		.images([builder.CardImage.create(null, `https://lucarras.azurewebsites.net/static/img/image${Math.floor(Math.random() * (9 - 1 + 1)) + 1}.png`)])
		.buttons([
			builder.CardAction.openUrl(null, 'http://www.microsoft.com', 'Microsoft'),
			builder.CardAction.openUrl(null, 'https://products.office.com/en-us/microsoft-teams/group-chat-software', 'Teams'),
			builder.CardAction.openUrl(null, 'http://www.bing.com', 'Bing')
		]);
}

/*
	Convenience method to create a Thumbnail card. Takes in an instance of BotBuilder and returns an attachment of type ThumbnailCard
*/
module.exports.createThumbnailCard = function(builder) {
	return new builder.ThumbnailCard()
		.title('This is a Thumbnail Card')
		.subtitle('Card subtitle')
		.text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vehicula, risus ac placerat vestibulum, quam metus congue augue, sed placerat elit metus a odio. Suspendisse nec odio in elit bibendum mollis vel eu diam. Integer id mollis orci, sed iaculis nibh. Suspendisse venenatis lacus neque, quis semper arcu tempus sed. Nunc quam augue, pulvinar at eros ac, bibendum ornare metus. Phasellus vitae enim augue.')
		.images([
			builder.CardImage.create(null, `https://lucarras.azurewebsites.net/static/img/image${Math.floor(Math.random() * (9 - 1 + 1)) + 1}.png`)
		])
		.buttons([
			builder.CardAction.openUrl(null, 'http://www.microsoft.com', 'Microsoft'),
			builder.CardAction.openUrl(null, 'https://products.office.com/en-us/microsoft-teams/group-chat-software', 'Teams'),
			builder.CardAction.openUrl(null, 'http://www.bing.com', 'Bing')
		]);
}

// Creates a random task
module.exports.createTask = function() {
	return {
		'title': faker.fake("{{commerce.productName}}"),
		'description': faker.fake("{{lorem.sentence}}"),
		'assigned': faker.fake("{{name.firstName}} {{name.lastName}}")
	}
}

// Convenience method to strip out @ mentions from bot text
module.exports.getTextWithoutMentions = function(message) {
	var text = message.text;
	if (message.entities) {
		message.entities
			.filter(entity => entity.type === "mention")
			.forEach(entity => {
				text = text.replace(entity.text, "");
			});
		text = text.trim();
	}
	return text;
}

// Generates rich connector card.
//TODO: test updating a card and rich actionable cards
module.exports.generateConnectorCard = function(actions) {
	var ret =  {
		'summary': faker.fake("{{lorem.sentence}}"),
		'title': faker.fake("{{commerce.productName}}"),
		'sections': [{
			'activityTitle': faker.fake("{{name.firstName}} {{name.lastName}}"),
			'activitySubtitle': "On Project Tango",
			'activityText': faker.fake("{{lorem.paragraphs}}"),
			'activityImage': `https://lucarras.azurewebsites.net/static/img/image${Math.floor(Math.random() * (9 - 1 + 1)) + 1}.png`
		}, {
			'title': 'Images',
			'images': [{
				'image': `https://lucarras.azurewebsites.net/static/img/image1.png`
			},{
				'image': `https://lucarras.azurewebsites.net/static/img/image2.png`
			},{
				'image': `https://lucarras.azurewebsites.net/static/img/image3.png`
			},{
				'image': `https://lucarras.azurewebsites.net/static/img/image4.png`
			},{
				'image': `https://lucarras.azurewebsites.net/static/img/image5.png`
			},{
				'image': `https://lucarras.azurewebsites.net/static/img/image6.png`
			},{
				'image': `https://lucarras.azurewebsites.net/static/img/image7.png`
			},{
				'image': `https://lucarras.azurewebsites.net/static/img/image8.png`
			},{
				'image': `https://lucarras.azurewebsites.net/static/img/image9.png`
			}]
		}],
		'potentialAction': []
	}

	for (var i = 0; i < actions.length; i++) {
		ret.potentialAction.push({
			'@context': 'http://schema.org',
			'@type': 'ViewAction',
			'name': actions[i].name,
			'target': [
				actions[i].target
			]
		});
	}

	return ret;
}