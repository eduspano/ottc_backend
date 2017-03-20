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

 File: receiver.js
 Authors:  Julian Monteiro
 Date: 2017-03-13
 */
var logger = require('log4js').getLogger('receiver');
var _ = require("underscore");
var async = require("async");
var AccesOprt = require('./../models/db/postgres/iot_db_post_accessOprt');

//var userDAO = require("../lib/user.js");
var queue = require("../lib/queue.js");

/*
 * processa mensagem, monta envelope e envia para fila
 */

var Position = {};

Position.processRequest = function (request, response) {
    var body = request.body;

    logger.info("processRequest ",body);

    var error = verifyMessage(body);
    if (error) {
        logger.error("error verify params: ",error);
        return response.status(200).send({status: 'error', message: error});
    }

    processMessage(body, function (err) {

        if (err) {
            logger.error("error processing: ",error);
            return response.status(200).send({status: 'error', message: err});
        } else {
            response.status(200).send({status: 'ok', message: "A mensagem foi enviada."});
        }

    });
};

function verifyMessage(body) {
    if (!body.provider) {
        return "invalid format - provider_not_found";
    }

    if (!body.agency) {
        return "invalid format - agency_not_found";
    }

    if (!body.user_id) {
        return "invalid format - user_id_not_found";
    }

    if (!body.service) {
        return "invalid format - service_not_found";
    }

    return false;
}

function processMessage(body, callback) {

    body.ts_server = new Date();

    var msg = queue.createMessage(body.user_id, body.provider, body.agency, body.service, body);

    // logger.debug('received msg from:',msg.provider, "agency:", msg.agency, " gps: ", msg.data);
    queue.sendToLiveQueue(msg, function (err, res) {
        if (err || !res) {
            return callback("Error_queuing: ", err);
        }
        callback(null);
    });
}

module.exports = Position;



