/**
 Projeto OTTC - Operadora de Tecnologia de Transporte Compartilhado
 Copyright (C) <2017> Scipopulis Desenvolvimento e Análise de Dados Ltda

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.

 File: queue.js
 Authors:  Julian Monteiro
 Date: 2016-06-18
 */
var logger = require('log4js').getLogger('queue');
var config = require("./config.js");
var util = require("./util.js");

if (util.isUndefined(config.queueService)) {
    console.log("config: ", config);
    throw Error("config.queueService is undefined. Please choose a valid one.");
}

logger.info("using service", config.queueService);

var Queue = require("./queue/" + config.queueService + ".js");

var queue = new Queue();

//Interface:
// queue.removeQueues
// queue.configQueues
// queue.createMessage
// queue.sendToLiveQueue

queue.createMessage = createMessage;

module.exports = queue;

function createMessage(user_id, provider, agency, service, data) {
    return {
        "user_id": user_id,
        "provider": provider,
        "agency": agency,
        "service": service,
        "data": data
    };
};