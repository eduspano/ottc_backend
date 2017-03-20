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

 Rabbit queue

 File: rabbitmq.js
 Authors:  Julian Monteiro
 Date: 2017-01-20
 */


// https://github.com/mafintosh/thunky

// extraído / baseado em código disponível em:
// http://www.mzan.com/article/35369476-how-to-properly-check-if-rabbitmq-channel-has-been-opened-after-reconnection-in.shtml
// http://tommytcchan.blogspot.com.br/2012/07/using-node-and-rabbitmq-step-by-step.html

//-- outros docs

// http://stackoverflow.com/questions/21742232/rabbitmq-dead-letter-exchange-never-getting-messages
// https://derickbailey.com/2015/07/22/airport-baggage-claims-selective-consumers-and-rabbitmq-anti-patterns/
// https://www.rabbitmq.com/ttl.html

// no auto-reconnect: https://github.com/squaremo/amqp.node/issues/25
var logger = require('log4js').getLogger('AMQP');

var amqp = require('amqplib/callback_api');
var _ = require('underscore');
var async = require('async');

var config = require("../config.js");
var config_rabbitmq = config.rabbitmq;

var RabbitMQ = function() {
    this.connecting = false;
    this.rabbitChannel = null;
    this.counter = 0;
};

RabbitMQ.prototype.getLiveQueueName = function(provider) {
    return config_rabbitmq.liveQueue.namePrefix + ":" + provider
};

RabbitMQ.prototype.getDeadQueueName = function(provider) {
    return config_rabbitmq.deadQueue.namePrefix + ":" + provider
};


RabbitMQ.prototype.removeQueues = function(callback) {
    var self = this;

    async.series([
        function(cbk) {
            self.connect(cbk);
        },

        function(cbk) {
            var providers = config_rabbitmq.services;
            async.each(providers, function(provider, cbk_each) {
                self.deleteQueuesProvider(provider, cbk_each);
            }, cbk);
        },

        function(cbk) {
            logger.debug("deleteExchange ",config_rabbitmq.liveQueue.exchange);
            self.rabbitChannel.deleteExchange(config_rabbitmq.liveQueue.exchange, {}, cbk);
        },

        function(cbk) {
            logger.debug("removeExchange ",config_rabbitmq.deadQueue.exchange);
            self.rabbitChannel.deleteExchange(config_rabbitmq.deadQueue.exchange, {}, cbk);
        }

    ],callback);

};



RabbitMQ.prototype.configQueues = function(callback) {
    var self = this;

    async.series([
        function(cbk) {
            self.connect(cbk);
        },

        function(cbk) {
            logger.debug("assertExchange ",config_rabbitmq.liveQueue.exchange);
            self.rabbitChannel.assertExchange(config_rabbitmq.liveQueue.exchange, 'topic', {durable: true}, cbk);
        },

        function(cbk) {
            logger.debug("assertExchange ",config_rabbitmq.deadQueue.exchange);
            self.rabbitChannel.assertExchange(config_rabbitmq.deadQueue.exchange, 'direct', {durable: true}, cbk);
        },

        function(cbk) {
            var providers = config_rabbitmq.services;
            async.each(providers, function(provider, cbk_each) {
                self.createQueuesProvider(provider, cbk_each);
            }, cbk);
        }

    ],callback);

};

RabbitMQ.prototype.deleteQueuesProvider = function(provider, callback) {
    var self = this;
    logger.debug("* Deleting provider: ",provider);

    async.series([
        function(cbk) {
            logger.debug("  deleteQueue ",self.getLiveQueueName(provider));
            self.rabbitChannel.deleteQueue(self.getLiveQueueName(provider), {}, cbk);
        },

        function(cbk) {
            logger.debug("  deleteQueue ",self.getDeadQueueName(provider));
            self.rabbitChannel.deleteQueue(self.getDeadQueueName(provider), {}, cbk);
        },

        function(cbk) {
            logger.debug("  deleteQueue ",config_rabbitmq.storeQueue.name);
            self.rabbitChannel.deleteQueue(config_rabbitmq.storeQueue.name, {}, cbk);
        },

    ], callback);
};

RabbitMQ.prototype.createQueuesProvider = function(provider, callback) {
    var self = this;
    logger.debug("* Creating provider queues: ",provider);

    async.series([
        function(cbk) {
            logger.debug("  assertQueue ",self.getLiveQueueName(provider));
            self.rabbitChannel.assertQueue(self.getLiveQueueName(provider), config_rabbitmq.liveQueue.options, cbk);
        },
        function(cbk) {
            logger.debug("  bindExchange ",config.rabbitmq.liveQueue.exchange," -> ",self.getLiveQueueName(provider));
            self.rabbitChannel.bindQueue(self.getLiveQueueName(provider), config_rabbitmq.liveQueue.exchange, provider, null, cbk);
        },

        function(cbk) {
            logger.debug("  assertQueue ",self.getDeadQueueName(provider));
            self.rabbitChannel.assertQueue(self.getDeadQueueName(provider), config_rabbitmq.deadQueue.options, cbk);
        },

        function(cbk) {
            logger.debug("  bindExchange ",config_rabbitmq.deadQueue.exchange," -> ",self.getLiveQueueName(provider));
            self.rabbitChannel.bindQueue(self.getDeadQueueName(provider), config_rabbitmq.deadQueue.exchange, provider, null, cbk);
        },

        function(cbk) {
            logger.debug("  assertQueue ",config_rabbitmq.storeQueue.name);
            self.rabbitChannel.assertQueue(config_rabbitmq.storeQueue.name, config_rabbitmq.storeQueue.options, cbk);
        },

        function(cbk) {
            logger.debug("  bindExchange ",config.rabbitmq.liveQueue.exchange," -> ",config_rabbitmq.storeQueue.name);
            self.rabbitChannel.bindQueue(config_rabbitmq.storeQueue.name, config_rabbitmq.liveQueue.exchange, "#", null, cbk);
        },


    ], callback);
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

RabbitMQ.prototype.connect = function(callback) {
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
            self.rabbitChannel = null;

            if (err.message !== "Connection closing") {
                logger.error("connection error", err);
            } else {
                logger.warn("connection error - (closed)", err);
            }
        });

        connection.on("close", function (err) {
            self.connecting = false;
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

            callback(null);

        });
    });
};

RabbitMQ.prototype.sendToLiveQueue = function(message, callback) {
    this.sendToQueue(config.rabbitmq.liveQueue,message, callback);
};

RabbitMQ.prototype.sendToQueue = function(queueOptions, message, callback) {
    var self = this;

    // if connection and channel not existent, create it
    if (!self.isConnected()) {

        self.connect(function(err) {
            if (err) {
                logger.error('Error connecting to RabbitMQ: ',err);
                return callback(err);
            }

            self.sendToLiveQueue(message,callback);
        });

        return;
    }

    logger.debug("sending msg "+self.counter+" "+config_rabbitmq.liveQueue.exchange+' provider',message.provider);

    var buffer = null;

    try {
        console.log("Message:",message);
        buffer = new Buffer(JSON.stringify(message));
    } catch (e) {
        console.error(e);
        callback("error converting message to string: "+e);
        return;
    }

    // ---  send message ---

    // logger.debug("queueOptions.exchange "+queueOptions.exchange+" message.provider: "+message.service);
    var sent = self.rabbitChannel.publish(queueOptions.exchange, message.service, buffer, queueOptions.messageOptions, {contentType: 'application/json'});
    self.counter++;

    if (sent) {
        callback(null, sent);
    } else {
        callback("error sending to queue");
    }

};

// -------

module.exports = RabbitMQ;