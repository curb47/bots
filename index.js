var Botkit = require('botkit');
var Witbot = require('witbot');

var slackToken = process.env.SLACK_TOKEN;
var witToken = process.env.WIT_TOKEN;
var openWeatherApiKey = process.env.OPENWEATHER_KEY;

console.log('Wit Token: ' + witToken);

var controller = Botkit.slackbot({
	debug: false
});

controller.spawn({
	token: slackToken
}).startRTM(function (err, bot, payload) {
	if (err) {
		throw new Error('Error connecting to slack: ', err);
	}
	console.log('Connected to slack');
});

var witbot = Witbot(witToken);

var weather = require('./weather')(openWeatherApiKey);

controller.hears('.*', 'direct_message,direct_mention', function(bot, message) {
	wit = witbot.process(message.text, bot, message);

	wit.hears('hello', 0.5, function(bot, message, outcome) {
		bot.reply(message, 'Hello to you as well!');
	    // bot.startConversation(message, function (_, convo) {
	    //   convo.say('Hello!')
	    //   convo.ask('How are you?', function (response, convo) {
	    //     witbot.process(response.text)
	    //       .hears('good', 0.5, function (outcome) {
	    //         convo.say('I am so glad to hear it!')
	    //         convo.next()
	    //       })
	    //       .hears('bad', 0.5, function (outcome) {
	    //         convo.say('I\'m sorry, that is terrible')
	    //         convo.next()
	    //       })
	    //       .otherwise(function (outcome) {
	    //         convo.say('I\'m cofused')
	    //         convo.repeat()
	    //         convo.next()
	    //       })
	    //   })
	    // })
	})
	// .otherwise(function(bot, message, outcome) {
	// 	bot.reply(message, "I'm sorry, I didn't catch that?");
	// });

	wit.hears('weather', 0.5, function(bot, message, outcome) {
		if (!outcome.entities || !outcome.entities.location || outcome.entities.location.length === 0) {
			bot.reply(message, 'I\'d love to give you the weather, but for where?');
			return;
		}

		var location = outcome.entities.location[0];
		weather.get(location.value, function(err, msg) {
			if (err) {
				console.log(err);
				bot.reply(message, "Uh-oh... I can't seem to find the weather");
				return;
			}

			bot.reply(message, msg);
		});
	});
});


// witbotListener.hears('hello', 0.5, function(bot, message, outcome) {
// 	bot.reply(message, 'Hello to you as well!');
// });