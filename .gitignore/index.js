const Discord = require('discord.js'); // Récupération de la bibliothèque discord
const bot = new Discord.Client(); // Création du client bot discord
const prefix = '::'; // Préfixe utiliser pour les commandes

// Création de la base de donnée
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const adapter = new FileSync('database.json');
const db = low(adapter); // Base de donnée

db.defaults({utilisateur: []}).write();

bot.on('ready', () => {
    bot.user.setActivity('Imiter le Kraken', {type: 'PLAYING'}); // Assignation du jeu auquel joue au bot
});

bot.on('guildMemberAdd', member =>{
    var role = member.guild.roles.find('name', 'Docker');
    var reglement = member.guild.channels.find("name", "reglement");
    var presentation = member.guild.channels.find("name", "presentation");
    const embed = new Discord.RichEmbed()
    .setTitle('Nouvel Arrivant')
    .setColor(0x000F84)
    .setAuthor("Bienvenue à Bord !!", member.user.avatarURL)
    .setDescription(`Hey ! Salut à toi, ${member.user} ! Tu es ici sur le serveur discord de la communauté ${member.guild.name}, tu es invité à lire le ${reglement} . Tu as pour le moment un rôle restreint afin d'avoir accès à tout le discord nous t'invitons à faire une petite ${presentation} puis à contacter un membre du Staff pour l'entretien !`);
    member.guild.channels.find("name", "accueil").send(embed);
    member.addRole(role);
    
    if(!db.get("utilisateur").find({user: member.user.id}).value()){
        db.get("utilisateur").push({user: member.user.id, xp: 1, warn: 1}).write();
    }
});

bot.on('guildMemberRemove', member =>{
    const embed = new Discord.RichEmbed()
    .setTitle('Départ')
    .setColor(0x000F84)
    .setAuthor("Un utilisateur a quitté le serveur", member.user.avatarURL)
    .setDescription(`${member.user} s'est barré !!`)
    member.guild.channels.find("name", "quartier-maître").send(embed);
});

bot.on('message', message => {
    var msgAuthor = message.author.id;

    const embedNonDroit = new Discord.RichEmbed()
            .setTitle('Erreur')
            .setColor(0xfc0043)
            .setAuthor("Pas les droits", message.author.avatarURL)
            .setDescription(`Désolé, ${message.author}, tu n'as pas les droits pour utiliser cette commande !`); // Embed par defaut d'une commande demandée dans les droits 

    if(message.author.bot) return; // Si le message ne commence pas par le préfixe ou que c'est le bot on ignore

    if(!db.get("utilisateur").find({user: msgAuthor}).value()){
        db.get("utilisateur").push({user: msgAuthor, xp: 1, warn: 1}).write();
    }else{
        var userXpDb = db.get("utilisateur").filter({user: msgAuthor}).find('xp').value();
        var userXp = Object.values(userXpDb);

        db.get("utilisateur").find({user: msgAuthor}).assign({xp: userXp[1] += 20}).write();
    }

    if(!message.content.startsWith(prefix)) return;

    // Affichage de son xp
    if(message.content === prefix + "xp"){
        var xp = db.get("utilisateur").filter({user: msgAuthor}).find('xp').value();
        var xpFinal = Object.values(xp);
        var embedXp = new Discord.RichEmbed()
            .setTitle("Statistiques")
            .setAuthor("Expérience", message.author.avatarURL)
            .setColor(0x000F84)
            .setDescription("Affichage des statistiques")
            .addField("XP:", `${xpFinal[1]} xp`);
        message.channel.send(embedXp);
    }

    // Récapitulatif des commandes disponible pour le bot
    if(message.content === prefix + 'help'){
        var helpEmbed = new Discord.RichEmbed()
        .setTitle('Help')
        .setColor(0x000F84)
        .setDescription('Recapitulatif des Commandes d\'Octobot !')
        .addField("Préfixe pour utiliser le bot", "Le préfixe à utiliser avec le bot pour toutes les commandes est **::**")
        .addField("::game" , "Les commandes pour s'attribuer ou retirer un jeu, les majuscules ne sont pas prises en compte Exemple: *::game overwatch*")
        .addField("::jeux", "La commande pour afficher les jeux disponibles sur le Discord");
        message.channel.send(helpEmbed);
    }

    // Aquisition et perte des ranks
    var listeRole = [
        "Rocket League",
        "League of Legend",
        "For Honor",
        "Overwatch",
        "PUBG",
        "Paladin",
        "Fortnite",
        "World of Warcraft",
        "CSGO",
        "Brawlhalla",
        "Battlefield 1",
        "Monster Hunter World",
        "Hearthstone",
        "GTA V",
        "Rainbow 6 : Siege",
        "Apex Legends",
        "Sea of Thieves",
        "Black Ops 4"
    ];

    var reussite = 0;

    // Assignation ou retrait des ranks de jeux
    if(message.content.startsWith(prefix + "game")){
        listeRole.forEach(function(element){
            if(message.content.toLowerCase() === prefix + "game " + element.toLowerCase()){
                reussite = 1;
                let roleAssign = message.member.guild.roles.find("name", element);
                if(!message.member.roles.find("name", element)){
                    var roleEmbed = new Discord.RichEmbed()
                    .setTitle('Jeu Ajouté')
                    .setColor(0x00a51b)
                    .setAuthor("Assignation des Jeux", message.author.avatarURL)
                    .setDescription(`Bravo ! Tu as été ajouté à la liste des joueurs de **${element}** !!`);
                    message.channel.send(roleEmbed);
                    message.member.addRole(roleAssign);
                }else{
                    var roleEmbed = new Discord.RichEmbed()
                    .setTitle('Jeu Retiré')
                    .setColor(0xdd6300)
                    .setAuthor("Assignation des Jeux", message.author.avatarURL)
                    .setDescription(`Pale sans bleu ! Tu as été retiré de la liste des joueurs de **${element}** !!`);
                    message.channel.send(roleEmbed);
                    message.member.removeRole(roleAssign);
                }
            }else{
                if(reussite === 0){
                    reussite = 2;
                }
            }
        });
    }

    // Message d'erreur si le jeu demandé n'existe pas
    if(reussite === 2){
        var roleEmbed = new Discord.RichEmbed()
        .setTitle('Erreur')
        .setColor(0xfc0043)
        .setAuthor("Assignation des Jeux", message.author.avatarURL)
        .setDescription(`Attention le jeu **${message.content.split(" ")[1]}** n'éxiste pas !! Utilisez la commande **::jeux** pour connaitre les jeux présents sur le discord`);
        message.channel.send(roleEmbed);
    }

    var listeAfficheJeux = "";
    listeRole.forEach(function(element){
        listeAfficheJeux += "\n" + element;
    });
    
    // Affichage des jeux disponnibles sur le Discord
    if(message.content === prefix + "jeux"){
        var roleEmbed = new Discord.RichEmbed()
        .setTitle('Jeux Disponibles')
        .setColor(0x000F84)
        .setDescription(`Voici la liste des jeux disponibles sur ${message.guild.name} : ${listeAfficheJeux}`);
        message.channel.send(roleEmbed)
    }

    // Gestion des warns 
    if(message.content.split(" ")[0] === prefix + "warn"){
        var userWarn = message.mentions.users.first(); // Utilisateur à Warn
        if(message.member.hasPermission('ADMINISTRATOR')){
            var userWarnId = userWarn.id; // ID de l'utilisateur que l'on va warn

            if(!db.get("utilisateur").find({user: userWarnId}).value()){
                db.get("utilisateur").push({user: userWarnId, xp: 1, warn: 2}).write();
            }
            else if(db.get("utilisateur").filter({user: userWarnId}).find("warn").value() == null || db.get("utilisateur").filter({user: userWarnId}).find("warn").value() == undefined){
                db.get("utilisateur").find({user: userWarnId}).assign({warn: 2}).write()
            } else{
                var userWarnDb = db.get("utilisateur").filter({user: userWarnId}).find("warn").value(); // Récupération de l'objet Warn
                var warnNumber = Object.values(userWarnDb); // On cast l'objet
        
                db.get("utilisateur").find({user: userWarnId}).assign({warn: warnNumber[2] += 1}).write(); // On ajoute 1 à l'utilisateur
            }

            var nombreWarn = db.get("utilisateur").filter({user: userWarnId}).find("warn").value();
            var objetNombreWarn = Object.values(nombreWarn);
            var afficheWarnNumber = objetNombreWarn[2] - 1; // On met -1 car le nombre de Warn ne peut pas être à 0 donc il est à 1 par défaut

            // Message envoyé à l'utilisateur
            const embedWarn = new Discord.RichEmbed()
            .setTitle('Attention !')
            .setColor(0xfc0043)
            .setAuthor("Tu as reçu un avertissement", userWarn.avatarURL)
            .setDescription(`Salut ${userWarn} tu viens de recevoir un avertissement. Tu en as actuellement ${afficheWarnNumber}, au bout de 3 tu encoures un banissement.`);
            userWarn.send(embedWarn);

            // Message de retour affiché dans le channel dans lequel le Warn a été fait 
            const embedRetour = new Discord.RichEmbed()
                .setTitle('Avertissement envoyé')
                .setColor(0xfc0043)
                .setAuthor("L'avertissement a bien été envoyé", userWarn.avatarURL)
                .setDescription(`L'utilisateur ${userWarn} a été averti et a actuellement ${afficheWarnNumber} avertissements !`);
                message.channel.send(embedRetour);
        }else{
            message.channel.send(embedNonDroit);
        }
    }

    // Retrait d'un avertissement
    if(message.content.split(" ")[0] === prefix + "unwarn"){
        var userunWarn = message.mentions.users.first(); // Utilisateur à Warn
        if(message.member.hasPermission('ADMINISTRATOR')){
            var userunWarnId = userunWarn.id; // ID de l'utilisateur que l'on va warn
            const embedunRetour = new Discord.RichEmbed();

            var nombreunWarn = db.get("utilisateur").filter({user: userunWarnId}).find("warn").value();
            var objetNombreunWarn = null; 
            var afficheunWarnNumber = null;
            if(db.get("utilisateur").filter({user: userunWarnId}).find("warn").value() != undefined && db.get("utilisateur").filter({user: userunWarnId}).find("warn").value() != null){
                objetNombreunWarn =  Object.values(nombreunWarn);
                afficheunWarnNumber = objetNombreunWarn[2] - 2;
            } else{
                afficheunWarnNumber = 0;
            }

            if(db.get("utilisateur").find({user: userunWarnId}).value() && db.get("utilisateur").filter({user: userunWarnId}).find("warn").value() != null && db.get("utilisateur").filter({user: userunWarnId}).find("warn").value() != undefined && db.get("utilisateur").filter({user: userunWarnId}).find("warn").value() != 1){
                var userunWarnDb = db.get("utilisateur").filter({user: userunWarnId}).find("warn").value(); // Récupération de l'objet Warn
                var unwarnNumber = Object.values(userunWarnDb); // On cast l'objet
        
                db.get("utilisateur").find({user: userunWarnId}).assign({warn: unwarnNumber[2] -= 1}).write(); // On ajoute 1 à l'utilisateur

                embedunRetour
                .setTitle('Avertissement retiré')
                .setColor(0xfc0043)
                .setAuthor("L'avertissement a bien été retiré", userunWarn.avatarURL)
                .setDescription(`L'utilisateur ${userunWarn} a eu un Warn retiré et a actuellement ${afficheunWarnNumber} avertissements !`);
            } else{
                embedunRetour
                .setTitle('Impossible d\'enlever un Avertissement')
                .setColor(0xfc0043)
                .setAuthor("Utilisateur n'a pas d'avertissement", userunWarn.avatarURL)
                .setDescription(`L'utilisateur ${userunWarn} n'a pas d'avertissement, on ne peut donc pas lui en retirer !`);
            }
   
            // Message de retour affiché dans le channel dans lequel le Warn a été fait 
            message.channel.send(embedunRetour);
        }else{
            message.channel.send(embedNonDroit);
        }
    }
    
        if(message.content === prefix + 'online'){
        var nombreMembreTot = message.guild.members.size;
        var nombreMembreCo = message.guild.members.filter(m=> m.presence.status === 'online').size;
        var membreCOEmbed = new Discord.RichEmbed()
        .setTitle('Qui est connecté ?')
        .setAuthor(message.guild.name, message.guild.iconURL)
        .setColor(0x000F84)
        .setDescription(`Actuellement il y a ${nombreMembreCo}/${nombreMembreTot} membres en ligne sur le serveur ${message.guild.name} !`);
        message.channel.send(membreCOEmbed);
    }
});

bot.login(process.env.TOKEN);
