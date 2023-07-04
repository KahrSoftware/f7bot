/*
 * Kahr f7bot version2
 */

const Discord = require('discord.js');
const client = new Discord.Client();

// regular experession for a command
const cmdRe = /\/|##|#/;
const rollRe = /\d*d\d+([\+-]\d+)?$/;
const newRollRe = /(?<dice>\d+)?d(?<sides>\d+)?((?<positive>[\+-])(?<modifier>\d+))?$/;
const newRollRe2 = /((?<dice>\d+)d(?<sides>\d+))?((?<positive>[\+-])(?<modifier>\d+))?$/;

/*
 * Roll a die and return a random int between 1 and sides
 */
function rollDie(sides) {
	return Math.ceil(Math.random() * sides);
}

/*
 * Take in a command and return a dice roll objec
 * the dice roll object has the number of dice, the number sides on those dice,
 */
function parseCommand(command) {
 	
 	let dice = 1;
 	let sides = 20;
	let modifier = 0;
	let positive = true;

	if(command === "" | command[0] == '+' || command[0] == '-') {
		command = '1d20'+command;
	}
	let commandCopy = command;
	
	
	let match = newRollRe2.exec(command);
	
	if(!!match.groups.dice) {
		dice = parseInt(match.groups.dice,10);
	}
	if(!!match.groups.sides) {
		sides = parseInt(match.groups.sides,10);
	}
	if(!!match.groups.positive) {
		positive = match.groups.positive=='+'?true:false;
	}
	if(!!match.groups.modifier) {
		modifier = parseInt(match.groups.modifier,10);
	}

	return {'dice':dice, 'sides':sides, 'modifier':modifier, 'positive':positive, 'command':commandCopy};

 }

 function doRolls(rollObj) {

	let total = 0;
	let thisRoll = 0;
	let results = [];

	for(let i = 0; i < rollObj.dice; i++) {

		thisRoll = rollDie(rollObj.sides);
		total += thisRoll;
		results.push(thisRoll);
	}

	total += rollObj.positive?rollObj.modifier:-1*rollObj.modifier;

	return {'total':total, 'results':results};

 }

client.on('message', message => {

	//console.log(message.content);
	if(message.content === '#ping') {
	let author = message.author.username;
	const pongEmbed = new Discord.MessageEmbed()
		.setColor('#0099ff')
		.setTitle('Pong!')
		.addField('Try 🅰️ when you have advantage! \nTry 🇩 when you have disdvantage! \nTry ☄️ when you have guidance!', 'Now with less bugs! 🪲')

		.setTimestamp()
		.setFooter('ping pong @'+author);

	message.channel.send(pongEmbed);
	}
	else if(!message.author.bot && message.channel.name == 'dice-rolls' && cmdRe.test(message.content)) {

		let command = message.content.split(cmdRe)[1];
		let rollObj = parseCommand(command);
		let resultsObj = doRolls(rollObj);

		const basicEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Result: '+resultsObj.total)
				//.addField(results.toString(),'\u200b')
				.addField(name='['+resultsObj.results.toString()+'] '+(rollObj.modifier!=0?(rollObj.positive?'+ ':'- ')+rollObj.modifier:""), value=rollObj.command, inline=true)
				.setTimestamp()
				.setFooter('Rolled by @'+message.author.username);

		message.channel.send(basicEmbed);

	}

	if(message.author.username == 'f7bot' && message.embeds[0].title != 'Pong!') {
		message.react('🅰️');
		message.react('🇩');
		message.react('☄️');
	}

});

client.on('messageReactionAdd', (reaction, user) => {
	//console.log(user);

	if(!user.bot && reaction.message.author.bot) {
		// figure out which emoji

		//console.log(reaction);

		if(reaction._emoji.name==='🅰️'&&reaction.count===2) {

			let theEmbed = reaction.message.embeds[0];

			if(theEmbed.fields.length==1 || (theEmbed.fields.length==2 && theEmbed.fields[1].value=='Guidance!')) {
				let guidance = 0;

				let command = theEmbed.fields[0].value;
				let rollObj = parseCommand(command);
				
				// grab the original results
				let firstTotal = theEmbed.title;
				firstTotal = parseInt(firstTotal.split("Result: ")[1],10);

				// do another roll
				let resultsObj = doRolls(rollObj);

				// place the new result up top
				if(theEmbed.fields.length==2) {
					guidance = parseInt(theEmbed.fields[1].name.slice(1,-1),10);
					firstTotal-=guidance;
					theEmbed.setTitle('Result: '+(Math.max(resultsObj.total,firstTotal)+guidance));
					theEmbed.fields.pop();

				}
				else {
					theEmbed.setTitle('Result: '+Math.max(resultsObj.total,firstTotal));
				}

				//theEmbed.fields[0].inline=true;
				theEmbed.addField(name='['+resultsObj.results.toString()+'] '+
					(rollObj.modifier!=0?(rollObj.positive?'+ ':'- ')+rollObj.modifier:""), 
					value='Advantage!',
					inline=true);

				if(guidance>0) {
					theEmbed.addField(name='['+guidance+']', value='Guidance!', inline=true);
				}

				reaction.message.edit([theEmbed])
			}
		}

		if(reaction._emoji.name==='🇩'&&reaction.count===2) {

			let theEmbed = reaction.message.embeds[0];

			if(theEmbed.fields.length==1 || (theEmbed.fields.length==2 && theEmbed.fields[1].value=='Guidance!')) {
				let guidance = 0;

				let command = theEmbed.fields[0].value;
				let rollObj = parseCommand(command);
				
				// grab the original results
				let firstTotal = theEmbed.title;
				firstTotal = parseInt(firstTotal.split("Result: ")[1],10);

				// do another roll
				let resultsObj = doRolls(rollObj);

				// place the new result up top
				if(theEmbed.fields.length==2) {
					guidance = parseInt(theEmbed.fields[1].name.slice(1,-1),10);
					firstTotal-=guidance;
					theEmbed.setTitle('Result: '+(Math.min(resultsObj.total,firstTotal)+guidance));
					theEmbed.fields.pop();

				}
				else {
					theEmbed.setTitle('Result: '+Math.min(resultsObj.total,firstTotal));
				}

				//theEmbed.fields[0].inline=true;
				theEmbed.addField(name='['+resultsObj.results.toString()+'] '+
					(rollObj.modifier!=0?(rollObj.positive?'+ ':'- ')+rollObj.modifier:""), 
					value='Disadvantage!',
					inline=true);

				if(guidance>0) {
					theEmbed.addField(name='['+guidance+']', value='Guidance!', inline=true);
				}

				reaction.message.edit([theEmbed])
			}
		}

		if(reaction._emoji.name==='☄️'&&reaction.count===2) {
			let theEmbed = reaction.message.embeds[0];

			if(theEmbed.fields.length==1 || (theEmbed.fields.length==2 && theEmbed.fields[1].value!='Guidance!')) {

				let guidance = rollDie(4);

				let firstTotal = theEmbed.title;
				firstTotal = parseInt(firstTotal.split('Result: ')[1],10);

				theEmbed.setTitle('Result: '+(firstTotal+guidance));

				theEmbed.addField(name='['+guidance+']', value='Guidance!', inline=true);

				reaction.message.edit([theEmbed]);
			}
		}
		if(reaction._emoji.name==='🍆') {

			reaction.message.channel.send('Eggplant');
		}

	}

});


client.once('ready', () => {
	console.log('f7bot running');
});

// token removed
client.login('');