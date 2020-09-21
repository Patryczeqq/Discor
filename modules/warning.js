const { Warning } = require('../modules/database/models')
const Discord = require('discord.js')

module.exports.run = (bot, message, wUser, wReason, settings) => {
  console.log("warning issued")
  //retrieve user data in warning database
  Warning.findOne({
    userID: wUser.user.id,
    guildID: message.guild.id
  }, async (err, res) => {
    if (err) bot.logger.error(err.message)
    //This is their first warning
    if (!res) {
      const newWarn = new Warning({
        userID: wUser.user.id,
        guildID: message.guild.id,
        Warnings: 1
      })
      newWarn.save().catch(e => bot.logger.error(e.message))
      var embed = new Discord.MessageEmbed()
        .setColor(15158332)
        .setAuthor(`${wUser.user.username}#${wUser.user.discriminator} has been warned`, wUser.user.displayAvatarURL())
        .setDescription(`**Reason:** ${wReason}`)
      message.channel.send(embed).then(m => m.delete({ timeout: 30000}))
    } else {
      //This is NOT their warning
      res.Warnings = res.Warnings + 1
      if (res.Warnings == 2) {
        //Mutes user
        let muteRole = message.guild.roles.cache.find(role => role.id == settings.MutedRole)
        if (muteRole) {
          let muteTime = 300000 //5 minutes
          await(wUser.roles.add(muteRole))
        }
        var embed = new Discord.MessageEmbed()
          .setColor(15158332)
        	.setAuthor(`${wUser.user.username}#${wUser.user.discriminator} has been warned`, wUser.user.displayAvatarURL())
        	.setDescription(`**Reason:** ${wReason}`)
        message.channel.send(embed).then(m => m.delete({ timeout: 30000}))
        //update database
        res.save().catch(e => console.log(e))
        //remove role after time
        if (muteRole) {
          setTimeout(() => {
            wUser.roles.remove(muteRole).catch(e => console.log(e))
          }, muteTime)
        }
      } else {
        await wUser.send(`You got kicked from **${message.guild.name}** by ${message.author.username}\n Reason: \`Getting too many warnings\`.`)
        message.guild.member(wUser).kick(wReason)
        message.channel.send(`${wUser} was kicked for having too many warnings`).then(m => m.delete({ timeout: 3500}))
        bot.logger.log(`${wUser.user.tag} was kicked from server: [${message.channel.guild.id}].`)
        //Delete user from database
        Warning.collection.deleteOne({userID: wUser.user.id, guildID: message.guild.id})
      }
    }
    if (settings.ModLog == true) {
      var embed = new Discord.MessageEmbed()
        .setColor(15158332)
        if (res) {
          if (res.Warnings == 3) embed.setAuthor(`[KICK] ${wUser.user.username}#${wUser.user.discriminator}`, wUser.user.displayAvatarURL())
        } else {
          embed.setAuthor(`[WARN] ${wUser.user.username}#${wUser.user.discriminator}`, wUser.user.displayAvatarURL())
        }
        embed.addField("User:", `${wUser}`, true)
        embed.addField("Moderator:", `<@${message.author.id}>`,true)
        if (res) {
          if (res.Warnings != 3) {
            embed.addField("Warnings:", `${res.Warnings}`, true)
          }
        } else {
          embed.addField("Warnings:", `1`, true)
        }
        embed.addField("Reason:", wReason)
        embed.setTimestamp()
      let channel = message.guild.channels.cache.find(channel => channel.id == settings.ModLogChannel)
      if (channel) channel.send(embed)
    }
  })
}