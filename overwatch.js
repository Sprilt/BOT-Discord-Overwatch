/*Variable area*/
var Discord = require('discord.io');
var bot = new Discord.Client({
	token: "",
	autorun: true
});

/*Event area*/

bot.on("ready", function(event) {
	console.log("Connected!");
	console.log("Logged in as: ");
	console.log(bot.username + " - (" + bot.id + ")");
});

bot.on("message", function(user, userID, channelID, message, event) {
	
    //LANG
    var lang = 'en';
    
    /*console.log(user + " - " + userID);
	console.log("in " + channelID);
	console.log(message);
	console.log("----------");*/

    if(message.charAt(0)=='!' && message.indexOf('Error')==-1 && message.indexOf('Battletag')==-1){
        
        //Vector
        array_msg = message.split(' ');
        
        //COMMAND
        cm = message.toLowerCase().split(' ')[0];
        
        //INI ARRAY PLATFORMS/REGION
        var plat_reg = ["pc/us/", "pc/eu/", "psn/global/", "xbl/global/"];
        
        if(cm!='!ayuda' && cm!='!help' && array_msg.length>=2){

            //BATTLETAG
            tag = battletag(message);
            btag = '**Battletag:** '+tag+'\n';
            heroe='';
            if((cm=='!heroe' || cm=='!hero') && array_msg.length>=3){
                heroe = sheroe(message.split(' ')[1]);
                if(lang=='es')
                    btag+= '**Heroe:** '+heroe+'\n';
                else
                    btag+= '**Hero:** '+heroe+'\n';
            }else if(cm=='!heroe' || cm=='!hero')
                heroe='No Heroe';

            //COMMAND
            if(commandOW(cm,tag,heroe,plat_reg[0]) && heroe!='No Heroe'){
                
                var request = require('request');

                request('https://api.lootbox.eu/'+commandOW(cm,tag,heroe,plat_reg[0]), function (error, response, body) {
                    if (!error && response.statusCode == 200 && apiResult(body))
                            sendMessages(channelID, [":pushpin:<@"+userID+">\n"+createMessageApi1(body,btag,cm,lang)]);  
                    else{
                        request('https://api.lootbox.eu/'+commandOW(cm,tag,heroe,plat_reg[1]), function (error, response, body) {
                            if (!error && response.statusCode == 200 && apiResult(body))
                                sendMessages(channelID, [":pushpin:<@"+userID+">\n"+createMessageApi1(body,btag,cm,lang)]);
                            else{
                                request('https://api.lootbox.eu/'+commandOW(cm,tag,heroe,plat_reg[2]), function (error, response, body) {
                                    if (!error && response.statusCode == 200 && apiResult(body))
                                        sendMessages(channelID, [":pushpin:<@"+userID+">\n"+createMessageApi1(body,btag,cm,lang)]);
                                    else{
                                        request('https://api.lootbox.eu/'+commandOW(cm,tag,heroe,plat_reg[3]), function (error, response, body) {
                                            if (!error && response.statusCode == 200 && apiResult(body))
                                                sendMessages(channelID, [":pushpin:<@"+userID+">\n"+createMessageApi1(body,btag,cm,lang)]);
                                            else{
                                                if(lang=='es')
                                                    sendMessages(channelID, [":pushpin:<@"+userID+">\n```Error, si el problema persiste contactanos.```"]);
                                                else
                                                    sendMessages(channelID, [":pushpin:<@"+userID+">\n```Error, If problem persists please contact us.```"]);
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });

            }else
                sendMessages(channelID, ["<@"+userID+">\n\n```"+errorMessage(1,lang)+"```"]);

        }else
            sendMessages(channelID, ["<@"+userID+">\n\n```"+errorMessage(1,lang)+"```"]);
        
    }

});

bot.on("presence", function(user, userID, status, game, event) {
	/*console.log(user + " is now: " + status);*/
});

bot.on("any", function(event) {
	/*console.log(rawEvent)*/ //Logs every event
});

bot.on("disconnect", function() {
	console.log("Bot disconnected");
	/*bot.connect()*/ //Auto reconnect
});

/*Function declaration area*/
function sendMessages(ID, messageArr, interval) {
	var resArr = [], len = messageArr.length;
	var callback = typeof(arguments[2]) === 'function' ?  arguments[2] :  arguments[3];
	if (typeof(interval) !== 'number') interval = 1000;

	function _sendMessages() {
		setTimeout(function() {
			if (messageArr[0]) {
				bot.sendMessage({
					to: ID,
					message: messageArr.shift()
				}, function(err, res) {
					if (err) {
						resArr.push(err);
					} else {
						resArr.push(res);
					}
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
				});
				_sendMessages();
			}
		}, interval);
	}
	_sendMessages();
}

function sendFiles(channelID, fileArr, interval) {
	var resArr = [], len = fileArr.length;
	var callback = typeof(arguments[2]) === 'function' ? arguments[2] : arguments[3];
	if (typeof(interval) !== 'number') interval = 1000;

	function _sendFiles() {
		setTimeout(function() {
			if (fileArr[0]) {
				bot.uploadFile({
					to: channelID,
					file: fileArr.shift()
				}, function(err, res) {
					if (err) {
						resArr.push(err);
					} else {
						resArr.push(res);
					}
					if (resArr.length === len) if (typeof(callback) === 'function') callback(resArr);
				});
				_sendFiles();
			}
		}, interval);
	}
	_sendFiles();
}

function createMessageApi1(body,msg,cm,lang){
    JSON.parse(body,function(k, v) {
          if(lang=='es')
            s = traductor(k,cm);
          else
            s = translate(k,cm);
          if(s!='')
              msg+="**"+s+":** "+v+"\n"; 
    });
    
    if(lang=='es')
        return msg.replace("hours"," horas").replace("minutes"," minutos").replace("seconds"," segundos").replace("hour"," hora").replace("minute"," minuto").replace("second"," segundo");
    else
        return msg.replace("hours"," hours").replace("minutes"," minutes").replace("seconds"," seconds").replace("hour"," hour").replace("minute"," minute").replace("second"," second");
}

function apiResult(body){
    var error = 1;
    JSON.parse(body,function(k, v) {
        if(k=='statusCode')
            error = 0;
    });
    return error;
}

function commandOW(cm,bt,heroe,plat_reg){
    
    switch(cm) {
       case '!profile':
       case '!perfil': 
                            return plat_reg+''+bt.replace("#","-")+'/profile';
       case '!hero':
       case '!heroe':       
                            return plat_reg+''+bt.replace("#","-")+'/hero/'+heroe.replace("Torbjorn","Torbjoern")+'/';
       case '!combate': 
       case '!asistencia':        
       case '!records':          
       case '!promedio':    
       case '!muerte':       
       case '!muerte':    
       case '!medallas':
       case '!combat':   
       case '!assists':       
       case '!best':    
       case '!average':          
       case '!death':          
       case '!medals':  
                            return plat_reg+''+bt.replace("#","-")+'/allHeroes/';
       default: return 0;
    }

}

function sheroe(heroe){
    heroe = heroe.toLowerCase();
    heroe =  heroe.charAt(0).toUpperCase() + heroe.slice(1);
    switch(heroe){
        case 'Mccree':
            return 'McCree';
        case 'D.va'
            return 'D.Va';
        default: return heroe;
    } 
}

function battletag(command){  
    var res=command.split(' ');
    var bt='';
    var i=1;
    if(res[0]=='!heroe' || res[0]=='!hero')
        i = 2;
    for(;i<res.length;i++){
        bt+=res[i];
        if(i+1!=res.length)
            bt+=' ';
    }
    return bt;
}

function translate(s,cm){
    switch(cm) {
        case '!profile':
                        switch(s) {
                                case 'level':                   return 'Level';
                                case 'win_percentage':          return 'Win percentage';
                                case 'wins':                    return 'Wins';
                                case 'lost':                    return 'Lost';
                                case 'played':                  return 'Played';
                                case 'playtime':                return 'Playtime';
                                default: return '';
                        }
                        break;
        case '!hero':
                        switch(s) {
                                case 'TimePlayed':              return 'Time Played';
                                case 'WinPercentage':           return 'Win percentage';
                                case 'GamesWon':                return 'Games won';
                                case 'WeaponAccuracy':          return 'Weapon Accuracy';
                                case 'EliminationsperLife':     return 'Eliminations per Life';
                                case 'KillStreak-Best':         return 'Kill Streak Best';
                                case 'Multikill-Best':          return 'Multikill Best';
                                case 'ObjectiveKills-Average':  return 'ObjectiveKills Average';
                                default: return '';
                        }
                        break;
        case '!combat':
                        switch(s) {
                                case 'MeleeFinalBlows':         return 'Melee Final Blows';
                                case 'SoloKills':               return 'Solo Kills';
                                case 'ObjectiveKills':          return 'Objective Kills';
                                case 'FinalBlows':              return 'Final Blows';
                                case 'DamageDone':              return 'Damage Done';
                                case 'Eliminations':            return 'Eliminations';
                                case 'EnvironmentalKills':      return 'Environmental Kills';
                                case 'Multikills':              return 'Multikills';
                                default: return '';
                        }
                        break;
         case '!assists':
                        switch(s) {
                                case 'HealingDone':                      return 'Healing Done';
                                case 'OffensiveAssists':                 return 'Offensive Assists';
                                case 'DefensiveAssists':                 return 'Defensive Assists';
                                case 'ReconAssists':                     return 'Recon Assists';
                                case 'TeleporterPadsDestroyed':          return 'Teleporter Pads Destroyed';
                                default: return '';
                        }
                        break;
         case '!best':
                        switch(s) {
                                case 'Eliminations-MostinGame':           return 'Eliminations - Most in Game';
                                case 'FinalBlows-MostinGame':             return 'FinalBlows - Most in Game';
                                case 'DamageDone-MostinGame':             return 'DamageDone - Most in Game';
                                case 'HealingDone-MostinGame':            return 'HealingDone - Most in Game';
                                case 'MeleeFinalBlows-MostinGame':        return 'Melee Final Blows - Most in Game';
                                case 'DefensiveAssists-MostinGame':       return 'Defensive Assists - Most in Game';
                                case 'OffensiveAssists-MostinGame':       return 'Offensive Assists - Most in Game';
                                case 'ObjectiveKills-MostinGame':         return 'Objective Kills - Most in Game';
                                case 'ObjectiveTime-MostinGame':          return 'Objective Time - Most in Game';
                                case 'Multikill-Best':                    return 'Multikill - Best';
                                case 'SoloKills-MostinGame':              return 'Solo Kills - Most in Game';
                                case 'TimeSpentonFire-MostinGame':        return 'Time Spent on Fire - Most in Game';
                                case 'ReconAssists-MostinGame':           return 'Recon Assists - Most in Game';
                                default: return '';
                        }
                        break;
         case '!average':
                        switch(s) {
                                case 'MeleeFinalBlows-Average':          return 'Melee Final Blows - Average';
                                case 'FinalBlows-Average':               return 'Final Blows - Average';
                                case 'TimeSpentonFire-Average':          return 'Time Spent on Fire - Average';
                                case 'SoloKills-Average':                return 'Solo Kills - Average';
                                case 'ObjectiveTime-Average':            return 'Objective Time - Average';
                                case 'ObjectiveKills-Average':           return 'Objective Kills - Average';
                                case 'HealingDone-Average':              return 'Healing Done - Average';
                                case 'FinalBlows-Average':               return 'Final Blows - Average';
                                case 'Deaths-Average':                   return 'Deaths - Average';
                                case 'DamageDone-Average':               return 'Damage Done - Average';
                                case 'Eliminations-Average':             return 'Eliminations - Average';
                                case 'OffensiveAssists-Average':         return 'Offensive Assists - Average';
                                case 'DefensiveAssists-Average':         return 'Defensive Assists - Average';
                                case 'ReconAssists-Average':             return 'Recon Assists - Average';
                                default: return '';
                        }
                        break;
          case '!death':  
                        switch(s) {
                                case 'Deaths':                           return 'Deaths';
                                case 'EnvironmentalDeaths':              return 'Environmental Deaths';
                                default: return '';
                        }
                        break;
          case '!medals':
                        switch(s) {
                                case 'Cards':                            return 'Cards';
                                case 'Medals':                           return 'Medals';
                                case 'Medals-Gold':                      return 'Medals - Gold';
                                case 'Medals-Silver':                    return 'Medals - Silver';
                                case 'Medals-Bronze':                    return 'Medals - Bronze';
                                default: return '';
                        }
                        break;
          default: return '';
    }
    return '';
}

function traductor(s,cm){
    switch(cm) {
        case '!perfil':
                        switch(s) {
                                case 'level':                   return 'Nivel';
                                case 'win_percentage':          return 'Porcentaje de victoria';
                                case 'wins':                    return 'Victorias';
                                case 'lost':                    return 'Derrotas';
                                case 'played':                  return 'Partidas';
                                case 'playtime':                return 'Horas de juego';
                                default: return '';
                        }
                        break;
        case '!heroe':
                        switch(s) {
                                case 'TimePlayed':              return 'Tiempo jugado';
                                case 'WinPercentage':           return 'Porcentaje de victoria';
                                case 'GamesWon':                return 'Partidas ganadas';
                                case 'WeaponAccuracy':          return 'Precisión con armas';
                                case 'EliminationsperLife':     return 'Eliminaciones por vida';
                                case 'KillStreak-Best':         return 'Mejor racha de muertes';
                                case 'Multikill-Best':          return 'Mejor muerte múltiple';
                                case 'ObjectiveKills-Average':  return 'Promedio de derribos en objetivo';
                                default: return '';
                        }
                        break;
        case '!combate':
                        switch(s) {
                                case 'MeleeFinalBlows':         return 'Golpes de gracia cuerpo a cuerpo';
                                case 'SoloKills':               return 'Derribos a solas';
                                case 'ObjectiveKills':          return 'Derribos en objetivo';
                                case 'FinalBlows':              return 'Golpes de gracia';
                                case 'DamageDone':              return 'Daño infligido';
                                case 'Eliminations':            return 'Eliminaciones';
                                case 'EnvironmentalKills':      return 'Derribos causados por el entorno';
                                case 'Multikills':              return 'Derribos múltiples';
                                default: return '';
                        }
                        break;
         case '!asistencia':
                        switch(s) {
                                case 'HealingDone':                      return 'Sanaciones realizadas';
                                case 'OffensiveAssists':                 return 'Asistencias ofensivas';
                                case 'DefensiveAssists':                 return 'Asistencias defensivas';
                                case 'ReconAssists':                     return 'Asistencias de reconocimiento';
                                case 'TeleporterPadsDestroyed':          return 'Teletransportadores destruidos';
                                default: return '';
                        }
                        break;
         case '!records':
                        switch(s) {
                                case 'Eliminations-MostinGame':           return 'Mayor cantidad de eliminaciones en una partida';
                                case 'FinalBlows-MostinGame':             return 'Mayor cantidad de golpes de gracia en una partida';
                                case 'DamageDone-MostinGame':             return 'Mayor cantidad de daño infligido en una partida';
                                case 'HealingDone-MostinGame':            return 'Mayor cantidad de sanación en una partida';
                                case 'MeleeFinalBlows-MostinGame':        return 'Mayor cantidad de golpes de gracia cuerpo a cuerpo en una partida';
                                case 'DefensiveAssists-MostinGame':       return 'Mayor cantidad de asistencias defensivas en una partida';
                                case 'OffensiveAssists-MostinGame':       return 'Mayor cantidad de asistencias ofensivas en una partida';
                                case 'ObjectiveKills-MostinGame':         return 'Mayor cantidad de derribos en objetivo en una partida';
                                case 'ObjectiveTime-MostinGame':          return 'Mayor tiempo en objetivo en una partida';
                                case 'Multikill-Best':                    return 'Mejor muerte múltiple';
                                case 'SoloKills-MostinGame':              return 'Más derribos a solas en una partida';
                                case 'TimeSpentonFire-MostinGame':        return 'Mayor tiempo en racha en el juego';
                                case 'ReconAssists-MostinGame':           return 'Mayor cantidad de asistencias de reconocimiento en una partida';
                                default: return '';
                        }
                        break;
         case '!promedio':
                        switch(s) {
                                case 'MeleeFinalBlows-Average':          return 'Promedio de golpes de gracia cuerpo a cuerpo';
                                // case 'FinalBlows-Average':               return 'Final Blows - Average';
                                case 'TimeSpentonFire-Average':          return 'Promedio de tiempo en racha';
                                case 'SoloKills-Average':                return 'Promedio de derribos a solas';
                                case 'ObjectiveTime-Average':            return 'Promedio de tiempo en objetivos';
                                case 'ObjectiveKills-Average':           return 'Promedio de derribos en objetivo';
                                case 'HealingDone-Average':              return 'Promedio de sanación realizada';
                                case 'FinalBlows-Average':               return 'Promedio de golpes de gracia';
                                case 'Deaths-Average':                   return 'Promedio de muertes';
                                case 'DamageDone-Average':               return 'Promedio de daño infligido';
                                case 'Eliminations-Average':             return 'Promedio de eliminaciones';
                                case 'OffensiveAssists-Average':         return 'Promedio de asistencias ofensivas';
                                case 'DefensiveAssists-Average':         return 'Promedio de asistencias defensivas';
                                case 'ReconAssists-Average':             return 'Promedio de asistencias de reconocimiento';
                                default: return '';
                        }
                        break;
          case '!muerte':
                        switch(s) {
                                case 'Deaths':                           return 'Muertes';
                                case 'EnvironmentalDeaths':              return 'Muertes sufridas por el entorno';
                                default: return '';
                        }
                        break;
          case '!medallas':
                        switch(s) {
                                case 'Cards':                            return 'Cartas';
                                case 'Medals':                           return 'Medallas';
                                case 'Medals-Gold':                      return 'Medallas de oro';
                                case 'Medals-Silver':                    return 'Medallas de plata';
                                case 'Medals-Bronze':                    return 'Medallas de bronce';
                                default: return '';
                        }
                        break;
          default: return '';
    }
    return '';
}

function errorMessage(value,lang){
    if(lang=='es'){
        switch(value){
                case 1:
                         msg =   "`!perfil, !combate, !asistencia, !records, !promedio, !muerte, !medallas`\n"+
                                 "   !perfil usuario#1595\n\n"+
                                 "`!heroe heroe Battletag `\n"+
                                 "   ej: !heroe Widowmaker usuario#1595\n\n"+
                                 "`Regiones`\n"+
                                 "   Solo soporte para us y eu\n\n"+
                                 "`Plataformas`\n"+
                                 "   PC - PSN - XBL \n\n"+
                                 "`Heroes`\n"+
                                 "  **Ofensivos:** *Genji, McCree, Pharah, Reaper, Soldier76, Tracer*\n"+
                                 "  **Defensivos:** *Bastion, Hanzo, Junkrat, Mei, Torbjorn, Widowmaker*\n"+
                                 "  **Tanques:** *D.Va, Reinhardt, Roadhog, Winston, Zarya*\n"+
                                 "  **Soportes:** *Lucio, Mercy, Symmetra, Zenyatta*\n\n"+
                                 "`Información`\n"+
                                 "  Bot realizado por la comunidad __*www.overwatchlatino.com*__ - Jucezt#9039\n"
                                break;
                case 2:
                         msg =   "`!perfil, !combate, !asistencia, !records, !promedio, !muerte, !medallas`\n"+
                                 "   !perfil usuario#1595\n\n"+
                                 "`!heroe heroe Battletag `\n"+
                                 "   ej: !heroe Widowmaker usuario#1595\n\n"+
                                 "`Regiones`\n"+
                                 "   Solo soporte para us y eu\n\n"+
                                 "`Plataformas`\n"+
                                 "   PC - PSN - XBL \n\n"+
                                 "  Bot realizado por la comunidad __*www.overwatchlatino.com*__ - Jucezt#9039\n";
                                 break;
                case 3:
                         msg =   "\n`!heroe heroe Battletag`\n"+
                                 "   ej: !heroe Widowmaker usuario#1595\n\n"+
                                 "`Heroes (El heroe "+heroe+" no se encuentra registrado!)`\n\n"+
                                 "  **Ofensivos:** *Genji, McCree, Pharah, Reaper, Soldier76, Tracer*\n"+
                                 "  **Defensivos:** *Bastion, Hanzo, Junkrat, Mei, Torbjorn, Widowmaker*\n"+
                                 "  **Tanques:** *D.Va, Reinhardt, Roadhog, Winston, Zarya*\n"+
                                 "  **Soportes:** *Lucio, Mercy, Symmetra, Zenyatta*\n";
                                 break;
                default: msg = '';
        }
    }else{
        switch(value){
                case 1:
                         msg =   "`!profile, !combat, !assists, !best, !average, !death, !medals`\n"+
                                 "   !profile user#1595\n\n"+
                                 "`!hero hero-name Battletag`\n"+
                                 "   ej: !hero Widowmaker user#1595\n\n"+
                                 "`Regions`\n"+
                                 "   US - EU\n\n"+
                                 "`Plataform`\n"+
                                 "   PC - PSN - XBL\n\n"+
                                 "`Heroes`\n"+
                                 "  **Offensive:** *Genji, McCree, Pharah, Reaper, Soldier76, Tracer*\n"+
                                 "  **Defensive:** *Bastion, Hanzo, Junkrat, Mei, Torbjorn, Widowmaker*\n"+
                                 "  **Tanks:** *D.Va, Reinhardt, Roadhog, Winston, Zarya*\n"+
                                 "  **Supports:** *Lucio, Mercy, Symmetra, Zenyatta*\n\n"+
                                 "`Information`\n"+
                                 "  Bot by __*www.overwatchlatino.com*__ - Jucezt#9039\n"
                                break;
                case 2:
                         msg =   "`!profile, !combat, !assists, !best, !average, !death, !medals`\n"+
                                 "   !profile user#1595\n\n"+
                                 "`!hero hero-name Battletag`\n"+
                                 "   ej: !hero Widowmaker user#1595\n\n"+
                                 "`Regions`\n"+
                                 "   US - EU\n\n"+
                                 "`Plataform`\n"+
                                 "   PC - PSN - XBL\n\n"+
                                 "  Bot by __*www.overwatchlatino.com*__ - Jucezt#9039\n"
                                 break;
                case 3:
                         msg =   "`!hero hero-name Battletag`\n"+
                                 "   ej: !hero Widowmaker user#1595\n\n"+
                                 "`Heroes ("+heroe+" not registered!)`\n\n"+
                                 "  **Offensive:** *Genji, McCree, Pharah, Reaper, Soldier76, Tracer*\n"+
                                 "  **Defensive:** *Bastion, Hanzo, Junkrat, Mei, Torbjorn, Widowmaker*\n"+
                                 "  **Tanks:** *D.Va, Reinhardt, Roadhog, Winston, Zarya*\n"+
                                 "  **Supports:** *Lucio, Mercy, Symmetra, Zenyatta*\n\n"
                                 break;
                default: msg = '';
        }
    }
    return msg;
}