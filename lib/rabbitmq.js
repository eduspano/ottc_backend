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

 File: rabbitmq.js
 Authors:  Andre yai
 Date: 2016-06-18
 */

// no auto-reconnect: https://github.com/squaremo/amqp.node/issues/25
var logger = require('log4js').getLogger('AMQP');

var amqp = require('amqplib/callback_api');
var _ = require('underscore');
var async = require('async');

var config = require("./config.js");
var config_rabbitmq = config.rabbitmq;

var RabbitMQ = function() {
    this.connecting = false;
    this.rabbitChannel = null;
    this.counter = 0;
};


RabbitMQ.prototype.close = function(callback) {
    if (!this.isConnected()) {
        return callback("queue channel - not connected");
    }

    this.rabbitChannel.close(callback);
};

RabbitMQ.prototype.isConnected = function() {
    return !!this.rabbitChannel;
};

RabbitMQ.prototype.connect = function(callback, callbackError) {
    var self = this;

    logger.debug("connect");

    if (self.isConnected()) {
        return callback(null);
    }

    if (self.connecting) {
        return callback("error - already trying to connect");
    }

    self.connecting = true;

    amqp.connect(config_rabbitmq.url, function (err, connection) {
        if (err) {
            self.connecting = false;
            self.rabbitChannel = null; //TODO: testar
            logger.error("error connecting to RabbitMQ: ",err.code," will retry in 1sec");
            return setTimeout(self.connect.bind(self,callback), 1000);
        }

        //close is already called after error event
        connection.on("error", function (err) {
            self.connecting = false;
            if (self.rabbitChannel) {
                console.log("closing channel;")
                self.rabbitChannel.close();
            }

            self.rabbitChannel = null;

            if (err.message !== "Connection closing") {
                logger.error("connection error", err);
            } else {
                logger.warn("connection error - (closed)", err);
            }
        });

        connection.on("close", function (err) {
            self.connecting = false;
            if (self.rabbitChannel) {
                console.log("closing channel;");
                self.rabbitChannel.close();
            }
            self.rabbitChannel = null;

            logger.error("connection close", (err?err:"(wihout error)"));
        });


        connection.on("blocked", function (err) {
            logger.error("connection blocked - forcing close connection", err);

            connection.close(function(err_close,res) {
                if (err_close) {
                    logger.error("connection error", err_close);
                }

                self.connecting = false;
                if (self.rabbitChannel) {
                    console.log("closing channel;");
                    self.rabbitChannel.close();
                }
                self.rabbitChannel = null;
            });

        });


        connection.createChannel(function (err, channel) {
            if (err) {
                logger.error("createChannel: ", err);
                self.connecting = false;
                return callback(err);
            }

            logger.info('CreateChannel: connection is reestablished');


            self.connecting = false;
            self.rabbitChannel = channel;

            callback(err,self.rabbitChannel);
        });
    });
};

module.exports = RabbitMQ;