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
var logger = require('log4js').getLogger('rideshare');
var _ = require("underscore");
var async = require("async");
var util = require("../../../lib/util");

var Latest = require('./latest');
var Position = require('./position');
var Ride = require('./ride');
var UsersOprtDB = require("./../../../models/db/postgres/pg_users");

var RideShareProcessor = function () {};

RideShareProcessor.consumeMessage = function(msg, callback) {

    var self = this;

    self.convertMessage(msg, function(err, converted_msg) {
        if (err) {
            if(!err.reuse){
                err = {reuse: false, msg:err};
            }
            return callback({reuse: false, msg:err});
        }

        Ride.buildRide(converted_msg, function(err) {
            if(err) {
                logger.error("error buildRide:",err);
                return callback(err);
            }

            self.savePosition(converted_msg, function (err) {
                if (err) {
                    logger.error("->> ERRO on save Message:",converted_msg.service, converted_msg.agency,err);
                    return callback({reuse: true, msg:err});
                }
                logger.debug("message finished");
                return callback(null);
            });

        });

    });
};



RideShareProcessor.convertMessage = function (msg, callback) {

    logger.debug("rideShareProcessor: convertingMessage ",msg);

    RideShareProcessor.findUser(msg, function(err, user) {
        if(err) {
           return callback(err,null);
        }

        var data = msg.data;

        if (!data || !data.ride_id || !data.lat || !data.lng || !data.ts) {
            return callback("Error parsing data", null);
        }

        var message = {
            "agency_id": msg.agency,
            "provider": msg.provider,
            "service": msg.service,

            "mobile_id": data.mobile_id,
            "battery": parseFloat(data.battery),
            "status": data.status,
            "ride_id": String(data.ride_id),
            "loc": {"lat": Number(data.lat), "lng": Number(data.lng)},
            "collected_at":  new Date(data.ts),
            "stored_at": new Date()
        };

        //TODO: rever
        if (message.status == "RE" || message.status == "W") {
            message["cpf"] = msg.user_id;
        }

        logger.debug("rideShareProcessor: convertedMessage ",message);
        return callback(null, message);
    });
};


RideShareProcessor.findUser = function(msg, cbk){
    UsersOprtDB.findUserByUserId(msg.user_id, function(err,user){
        if(err) {
            return cbk({reuse:true, msg:err}, null);
        }
        if(!user) {
            return cbk({reuse:false, msg:"No user with that account."}, null);
        }
        return cbk(null, user);
    });
};



RideShareProcessor.savePosition = function(msg, callback) {

    delete msg._id;
    delete msg.agency_id;
    delete msg.cpf;
    delete msg.user_id;

    msg.point = "("+msg.loc.lat+","+ msg.loc.lng+")";

    Position.insertNewPosition(msg, function(err) {
        if(err) {
            logger.error("error insertNewPosition:",err);
            return callback(err);
        }

        return Latest.updateLatestPosition(msg, callback);
    });
};

module.exports = RideShareProcessor;
