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

 Direct queue (bypass rabbitmq) - for testing purposes

 File: direct.js
 Authors:  Julian Monteiro
 Date: 2017-01-20
 */

// no auto-reconnect: https://github.com/squaremo/amqp.node/issues/25
var logger = require('log4js').getLogger('direct');

var _ = require('underscore');
var async = require('async');

var config = require("../config.js");

var consumer = require("../../consumer");

var Direct = function() {
    this.counter = 0;
};

Direct.prototype.removeQueues = function(callback) {
    logger.info("removeQueues");
    callback();
};

Direct.prototype.configQueues = function(callback) {
    logger.info("configQueues");
    callback();
};

Direct.prototype.sendToLiveQueue = function(message, callback) {

    consumer.consumeRideshareMessage(message, function(err,res) {

        if (err) {
            logger.error("consumeRideshareMessage error: ",err);
        }
        logger.info("consumeRideshareMessage info: ",res);

        callback(err,"ok");

    });

};

// -------

module.exports = Direct;