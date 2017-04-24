# Teams sample app for node.js

Included in this project is sample code for available features in Microsoft Teams

## The Node App

### Setting up:
Clone the repo, then type: “npm install --save” then “node app.js”
If you want to run locally there’s a couple things to do:
1. In app.js change process.env.ENVIROMENT from ‘cloud’ to ‘local’
2. In both ‘tabs/index.html’ and ‘tabs/configure.html’ update the ‘host’ variable to point to your local ngrok forwarding URL

If you want to run locally there’s a couple things to do:
1. In app.js change process.env.ENVIROMENT from ‘cloud’ to ‘local’
2. In both ‘tabs/index.html’ and ‘tabs/configure.html’ update the ‘host’ variable to point to your local ngrok forwarding URL

If you want to point to your own bots (which you’ll need to do for local development)
1. Update the app ids and passwords in app.js, and notifications/notifications.js

### App Personal Screen
When the app is sideloaded it will start appearing the the "Apps" flyout on the left app bar. Clicking on the app name in the flyout will open up the App's personal experience. For this sample app there are two static tabs set up: My Tasks and About.

### Connectors
Sideloading connectors is still in the works, so for now you’ll have to set up the connector for this app as an incoming webhook. Click on the ... menu for any channel and select add connector. Then click on incoming webhook, type a name, upload an icon and then grab the webhook url. Use the link below to trigger messages.

To trigger a message just paste this url in any browser:
https://lucarras.azurewebsites.net/api/messages/connector/send?webhook_url=[webhook url]

The triggered message gives you buttons to send yourself more messages…this should be fun.

**Not implemented:**
Looks like all the cool actionable cards are not yet hooked up…it should be pretty easy to update.
Also, updating a message…not sure how to do that

### Bots:
The bot implemented here responds to three commands: "create", "find", and "link". Create pretends to create a new card, and find pretends to find an existing card. Link you have to give it a tab name for a Tab from this app and it will generate a deep link

**Not implemented:**
Updating a message

### Notifications:
Notifications are implemented through the bot framework. But really all you need is an app ID and password. For this example, adding the app to a team generates a new message to that channel with links to send more notifications to that channel, and it also shows how to send individual notifications for each member of the channel

### Tabs
Creating, updating and configuring tabs is supported in this app

### Compose Extensions
Sample code for compose extensions exists in the "input" folder. This will show you how to create a queriable service for compose extensions

### Input Menus
Not implemented yet.


##The packages

You should be able to simply sideload these to any team. 

These versions of the packages point to our cloud hosted node js code
* Bot.zip: contains a manifest with a bot. Ask it for help. This also contains tabs, connector, and input extensions plus the home screen. 
* Notify.zip: contains the same manifest as above but it is a notifications only bot
