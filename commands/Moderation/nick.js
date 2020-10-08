module.exports.run = async (bot, message, args, emoji) => {
	if (message.deletable) message.delete();
	// Get user for nickname change
	const nickuser = message.guild.member((message.mentions.users.first()) ? message.mentions.users.first() : message.author);
	// Check if they are changing their own name or not (and check permission)
	if (nickuser == message.author) {
		if (!message.member.hasPermission('CHANGE_NICKNAMES')) {
			message.channel.send({ embed:{ color:15158332, description:`${emoji} You are missing the permission: \`CHANGE_NICKNAMES\`.` } }).then(m => m.delete({ timeout: 10000 }));
			return;
		}
	} else if (!message.member.hasPermission('MANAGE_NICKNAMES')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} You are missing the permission: \`MANAGE_NICKNAMES\`.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Make sure the bot can change other user's nicknames
	if (!message.guild.me.hasPermission('MANAGE_NICKNAMES')) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am missing the permission: \`MANAGE_NICKNAMES\`.` } }).then(m => m.delete({ timeout: 10000 }));
		bot.logger.error(`Missing permission: \`MANAGE_NICKNAMES\` in [${message.guild.id}].`);
		return;
	}
	// Make sure a nickname was provided in the command
	if (args.length == 0) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} Please enter a nickname.` } }).then(m => m.delete({ timeout: 10000 }));
		return;
	}
	// Get the nickanme
	const nickname = message.content.slice(6).replace(/<[^}]*>/, '').slice(1);
	// HERE CHECK IF THE NICKNAME HAS PROHIBTED CHARATACTERS/WORDS IN IT
	// Make sure nickname is NOT longer than 32 characters
	if (nickname.length >= 32) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} Nickname must be shorter than 32 characters.` } }).then(m => m.delete({ timeout: 5000 }));
		return;
	}
	// Change nickname and tell user (send error message if dosen't work)
	try {
		nickuser.setNickname(nickname);
		message.channel.send({ embed:{ color:3066993, description:`${(message.channel.permissionsFor(bot.user).has('USE_EXTERNAL_EMOJIS')) ? bot.config.emojis.tick : ':white_check_mark:'} *Successfully changed nickname of ${nickuser.user.username}#${nickuser.user.discriminator}.*` } }).then(m => m.delete({ timeout: 5000 }));
	} catch(e) {
		message.channel.send({ embed:{ color:15158332, description:`${emoji} I am unable to change ${nickuser.user.username}#${nickuser.user.discriminator} nickname.` } }).then(m => m.delete({ timeout: 10000 }));
	}
};

module.exports.config = {
	command: 'nick',
	aliases: ['nickname'],
	permissions: ['SEND_MESSAGES', 'EMBED_LINKS', 'CHANGE_NICKNAME', 'MANAGE_NICKNAMES'],
};

module.exports.help = {
	name: 'Nick',
	category: 'Moderation',
	description: 'Nickname a user',
	usage: '${PREFIX}nick <user> <name>',
};