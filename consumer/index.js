"use strict";
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


 Authors:  Andre Yai
 Date: 2016-12-22
 */

var logger = require('log4js').getLogger('backend_rabbit');
var amqp = require('amqplib/callback_api');
var _ = require("underscore");
var async = require("async");

var util = require("./../lib/util.js");
var config = require("./../lib/config.js");

var Agency = require("./../lib/agency.js");

var rideshareProcessor = require("./service/rideshare/rideshare.js");

// ===================================

var agencies = {};
_.each(config.agencies, function (agency) {
    agencies[agency.agency_id] = new Agency(agency);
});

// ===================================

var startQueueConsumer = function () {
    _.each(agencies, function (agency) {
        logger.info("Starting consumer: ",agency.agency_id);
        connectAndConsume(config.proccessQueue + ':' + agency.service, consumeRideshareMessage);
    });
};


// ===================================

function connectAndConsume(queueName, consumerFunc) {

    var url = config.rabbitmq.url;

    amqp.connect(url, function (err, conn) {
        if (!conn) {
            logger.error("conn not available - check rabbit server is running");
            return;
        }
        conn.createChannel(function (err, ch) {
            ch.checkQueue(queueName);

            ch.prefetch(1);

            console.log(" [*] Waiting for messages in %s.", queueName);

            ch.consume(queueName, function (msg) {
                if (!msg) {
                    logger.error("consume msg null");
                    return;
                }

                // console.log(msg.content.toString());

                var message = null;
                try {
                    message = JSON.parse(msg.content.toString());
                } catch (e) {
                    logger.error("error paring msg", e);
                    return ch.nack(msg, false, false);
                }
                consumerFunc(message, function (err) {
                    if (err) {
                        logger.debug("error processing msg ", err);
                        return ch.nack(msg, false,err.reuse);
                    }
                    //logger.debug("ok processing msg ");

                    ch.ack(msg);
                });

            }, {noAck: false}, function (consumeOk) {
                logger.info("waiting for more messages ", consumeOk);
            });

        });
    });
}

function consumeRideshareMessage(msg, callback) {

    if (!agencies[msg.agency]) {
        //Not in the array
        var error = "Agency " + msg.agency + " not found in service agencies";
        callback(error);
        return;
    }

    rideshareProcessor.consumeMessage(msg, callback);
}

module.exports = {
    startQueueConsumer: startQueueConsumer, //usado pelo iot_consumer
    consumeRideshareMessage: consumeRideshareMessage, //usado pelo queue direct - testes
    agencies: agencies
}