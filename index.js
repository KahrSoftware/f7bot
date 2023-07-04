/*
 * f7bot index.js
 */

const Discord = require('discord.js');
const client = new Discord.Client();

const basicRollRe = /\d+d\d+$/;
const failRollRe = /\d+d\d+f\d+$/;

const addModifierRe = /.*\+\d+$/;

function rollDie(sides) {
	return Math.ceil(Math.random() * sides);
}


client.on('message', message => {
	
	// don't look at the bot's messages, only look at commands with #
	if(message.author.bot == false && message.content.slice(0,1) == '#') {
		
		let author = message.author.username;

		let command = message.content.slice(1);

		// search for an addition modifier at the end of the command
		let lastPlus = command.lastIndexOf('+');
		let addModifier = 0;
		// if there is such modifier
		if(lastPlus != -1) {
			//save the number for later
			addModifier = parseInt(command.slice(lastPlus),10);
			command = command.slice(0, lastPlus);
			// error check
			if(isNaN(addModifier)) {
				addModifier = 0;
			}

		}

		// search for a subtraction modifier
		let lastMinus = command.lastIndexOf('-');
		let minusModifier = 0;
		// if there is such modifier
		if(lastMinus != -1) {
			//save the number for later
			minusModifier = parseInt(command.slice(lastMinus),10);
			command = command.slice(0, lastMinus);
			// error check
			if(isNaN(minusModifier)) {
				minusModifier = 0;
			}

		}

		// apply the d20 shortcut
		if(command == '#' || command == '') {

			let total = 0;

			let thisRoll = 0;
			let results = [];

			thisRoll = rollDie(20);
			total += thisRoll;
			results.push(thisRoll);


			total += addModifier;
			total += minusModifier;

			const basicEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Result: '+total)
				.addField(results.toString(),'\u200b')
				.setTimestamp()
				.setFooter('Rolled by @'+author);

			message.channel.send(basicEmbed);
		}

		// apply the regex
		else if(failRollRe.test(command) == true) {

			command = command.split(/d|f/);
			
			let numRolls = parseInt(command[0], 10);
			let sides = parseInt(command[1], 10);
			let passNum = parseInt(command[2], 10);
			
			let total = 0;
			let unmodified = 0;
			let numMin = 0;
			let numMax = 0;
			let advantage = 0;
			let disadvantage = 0;

			let thisRoll = 0;
			let results = [];
			for(let i = 0; i < numRolls; i++) {
				
				thisRoll = rollDie(sides);

				if(thisRoll >= passNum) {
					total += 1;
					unmodified += 1;
					if(thisRoll == passNum) {
						disadvantage += 1;
					}
				}
				if(thisRoll == sides) {
					total += 1;
					numMax += 1;
				}
				if(thisRoll == 1) {
					total -= 1;
					numMin += 1;
				}

				results.push(thisRoll);
			}

			total += addModifier;
			total -= minusModifier;

			advantage = total + numMin;
			disadvantage = (-1 * disadvantage) + total;

			//console.log(total);
			//console.log(numMax);
			//console.log(numMin);

			//message.channel.send('```'+'Result: '+total+'\n'+sides+'\'s: ' + numMax+'\t1\'s: ' + numMin +'\tUnmodified Total: ' + unmodified+'\t'+'\n'+results.toString()+'```');
			//message.channel.send('**Result: '+total+'**\n'+sides+'\'s: ' + numMax+'\t1\'s: ' + numMin +'\tUnmodified Total: ' + unmodified+'\t'+'\n'+results.toString());

			const failEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Result: '+total)
				.addFields(
					{name: sides+'\'s', value: numMax, inline: true},
					{name: '1\'s', value: numMin, inline: true},
					{name: 'Unmodified', value: unmodified, inline: true}
				)
				.addFields(
					{name: 'Advantage', value: advantage, inline: true},
					{name: 'Disadvantage', value: disadvantage, inline: true}
				)
				.addField(results.toString(),'\u200b')
				.setTimestamp()
				.setFooter('Rolled by @'+author);

			message.channel.send(failEmbed);
		}

		else if(basicRollRe.test(command)) {

			command = command.split(/d/);

			let numRolls = parseInt(command[0], 10);
			let sides = parseInt(command[1], 10);

			let total = 0;

			let thisRoll = 0;
			let results = [];
			for(let i = 0; i < numRolls; i++) {

				thisRoll = rollDie(sides);
				total += thisRoll;
				results.push(thisRoll);
			}

			total += addModifier;
			total += minusModifier;

			//message.channel.send('```'+'Result: '+total+'\n'+results.toString()+'```');

			const basicEmbed = new Discord.MessageEmbed()
				.setColor('#0099ff')
				.setTitle('Result: '+total)
				.addField(results.toString(),'\u200b')
				.setTimestamp()
				.setFooter('Rolled by @'+author);

			message.channel.send(basicEmbed);

		}

	}

	// add adv and disadv
	//if(message.author.username == 'f7bot') {
	//	message.react('🅰️');
		//message.react('🇩');
	//}

	if(message.content === '#ping') {
		// send back "Pong." to the channel the message was sent in
		//message.channel.send('Pong.');
		let author = message.author.username;
		const pongEmbed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle('Pong!')
			.addField('Try \"##\" to roll 1d20.\nTry \"#+5\" to roll 1d20+5.', '\u200b')
			.setTimestamp()
			.setFooter('ping pong @'+author);

		message.channel.send(pongEmbed);
	}
});

/*
client.on('messageReactionAdd', reactObj => {

	console.log(reactObj.message.embeds);
	console.log(reactObj.message.embeds[0].fields);
});
*/


client.once('ready', () => {
	console.log('Ready!');
});

// token removed
client.login('');
