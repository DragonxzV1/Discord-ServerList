const Discord = require('discord.js');
const { isUrl } = require('../../functions.js');
const db = require('quick.db');

module.exports = {
    name: 'edit-server',
    description: '[ADMIN] edits a server',
    options: [
        {
            name: 'channel',
            description: 'Channel to add the vote to',
            type: 7,
            required: true,
        },
        {
            name: 'servername',
            description: 'Name of the server',
            type: 3,
            required: false,
        },
        {
            name: 'serverdescription',
            description: 'Description of the server',
            type: 3,
            required: false,
        },
        {
            name: 'servericon',
            description: 'Icon of the server',
            type: 11,
            required: false,
        },
        {
            name: 'serverowner',
            description: 'Owner of the server',
            type: 6,
            required: false,
        },
        {
            name: 'serverlink',
            description: 'Link to the server',
            type: 3,
            required: false,
        }
    ],

    async execute(bot, interaction) {
        if(!interaction.member.permissions.has('MANAGE_MESSAGES')) return await interaction.reply({content: 'You are not allowed to use this command.', ephemeral:true});
        const channel = interaction.options.getChannel('channel');
        const name = interaction.options.getString('servername');
        const description = interaction.options.getString('serverdescription');
        const icon = interaction.options.getAttachment('servericon');
        const ownerid = interaction.options.getUser('serverowner');
        const link = interaction.options.getString('serverlink');
        const type = interaction.options.getString('type');

        if (link && isUrl(link) === false) return await interaction.reply({content: 'The link is not a valid URL.', ephemeral:true});
        if (!db.has(`servers_${channel.parentId}.${channel.id}`)) return await interaction.reply({contnet: 'The type of the server is not valid.', ephemeral:true});

        let info = db.get(`servers_${channel.parentId}.${channel.id}`);
        if (name && info.name !== name) db.set(`servers_${channel.parentId}.${channel.id}.name`, name);
        if (link && info.link !== link) db.set(`servers_${channel.parentId}.${channel.id}.link`, link);
        if (description && info.description !== description) db.set(`servers_${channel.parentId}.${channel.id}.description`, description);
        if (icon && info.icon !== icon.attachment) db.set(`servers_${channel.parentId}.${channel.id}.icon`, icon.attachment);
        if (ownerid && info.ownerid.id !== ownerid.id) db.set(`servers_${channel.parentId}.${channel.id}.ownerid`, ownerid.id);

        const embed = new Discord.MessageEmbed()
            .setAuthor({
                name: db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.name`), 
                iconURL: db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.icon`) || interaction.guild.iconURL({dynamic:true})
            })
            .setColor('BLUE')
            .setDescription(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.description`) || '--')
            .setThumbnail(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.icon`))
            .addFields(
                {name: 'Discord Link', value: `[Click Here](${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.link`)})`, inline: true},
                {name: 'Server Owner', value: `<@${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.ownerid`)}>`, inline: true},
                {name: 'Votes', value: `${db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.votes`)}`, inline: true},
            )
            .setTimestamp()
            .setFooter({text: '© Server List IL'})
        await channel.messages.fetch(db.get(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.messageid`)));
        channel.messages.cache.get(db.get(`servers_${interaction.channel.parentId}.${interaction.channelId}.messageid`)).edit({embeds:[embed]});
        await interaction.reply({ content: 'Server edited successfully.', ephemeral:true });
    },
};
