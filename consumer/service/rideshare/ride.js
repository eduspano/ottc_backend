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

var logger = require('log4js').getLogger('ride');
var _ = require("underscore");
var async = require("async");

var ongoingString = "ONGOING";
var lateBeginString = "ONGOING_LATEBEGIN";
var closedTimeOutSring = "CLOSED_TIMEOUT";
var shortRideString = "_SHORT";
var fewPositionsString = "_FEW";
var closedString = "CLOSED";

var PositionUtil = require('../../../lib/position_util');
var AccessOprtDB = require("./../../../models/db/postgres/iot_db_post_accessOprt");
var Consolidate = require('./consolidateuserday.js');

var Ride = {};

Ride.manageRideMessage = function(message,sameRideMethod,notSameRideMethod,callback){

    logger.debug("ManageRideMessage");

    AccessOprtDB.findLatest(message.mobile_id, function(err,data){

        logger.debug("ERR:",err,"Data:",data);

        if(data){
            //first element ever on latest;
            if(data.length == 0){
                if(message.status != "W"){
                    logger.debug("CREATE NEW RIDE:",message);
                    return createNewRide(message,callback);
                }
                return cleanCPFAndCbk(message,callback);
            }
            else {
                if(data[0].ride_id == message.ride_id) {
                    return sameRideMethod(message,callback);
                }
                else {
                    return notSameRideMethod(message,callback);
                }
            }
        }
        else {
            logger.debug("ERRO:CANNOT CONNECT ON LATEST", err);
            callback(err,null);
        }
    });
};

Ride.buildRide = function(message, callback) {
    logger.log("rideShareProcessor: buildRide.");


    if (message.status == 'RB') {

        Ride.manageRideMessage(message,cleanCPFAndCbk,startNewRide, function (err, data) {
            callback(err, data);
        });
    }

    if(message.status == "R") {

        Ride.manageRideMessage(message,updateRidePosition,startNewRide, function (err, data) {
            callback(err, data);
        });
    }

    if (message.status == "RE") {

        Ride.manageRideMessage(message,updateRidePosition,startNewRide, function (err, data) {
            callback(err, data);
        })
    }

    if (message.status == "W") {

        Ride.manageRideMessage(message,cleanCPFAndCbk, closeOldsRides, function (err, data) {
            callback(err, data);
        })
    }
};

var cleanCPFAndCbk = function(message,cbk){

    if(message.cpf) {
        delete message.cpf;
    }

    cbk(null,null);
};

var startNewRide = function(message,callback){

        logger.debug("Start New Ride!!!");

        closeOldsRides(message, function(err,res) {

            if(err == message.ride_id){
                message.status = 'R';
                updateRidePosition(message, function (err, res) {
                    return callback(err,res);
                });
            }
            else {
                createNewRide(message,function (err, res) {
                    return callback(err,res);
                });
            }
         });
};

var updateRidePosition = function(message,callback){

    logger.debug("UPDATE RIDE!!!,Ride:",message.ride_id);

    AccessOprtDB.findRide(message.ride_id, function(err,ride) {

        logger.debug("UpdateRideSS:",message.mobile_id,ride,ride[0].ride_status.substr(0,7));

        if(err || ride.length == 0) {
            return callback(err,null);
        }

        if(ride[0].ride_status.substr(0,7) != ongoingString){
            return callback(null,null);
        }
        var reference = ride[0];

        logger.debug("reference:",reference.data.endPosition,message.loc);
        reference.distance_meters += PositionUtil.calculateDistanceSimple(reference.data.endPosition,message.loc);

        logger.debug(reference.distance_meters);

        reference.data.endPosition = message.loc;
        reference.num_positions += 1;
        reference.end_at = message.collected_at;
        reference.endposition_location = "("+message.loc.lat+","+ message.loc.lng+")";

        logger.debug("Reference EndPosition:",message.loc);

        //TODO: SEE Qtd and distance to modify ride_status if message.status = 'R';

        if(message.status == "RE") {
            reference.data.ride_status = closedString;
            var cpf = message.cpf;
            delete  message.cpf;
        }

        reference.data.error = setRideStatus(reference.distance_meters,reference.num_positions);

        reference.ride_status = reference.data.ride_status + reference.data.error;

        AccessOprtDB.updateRide(reference,function(err,res){
            if(res){
                return Consolidate.buildConsolidate(reference,cpf,callback);
            }
            else{
                return callback(err,null);
            }
        });

    });
};

var createNewRide = function(message,callback){

    logger.debug("CreateNewRide:",message.ride_id);

    var rideStatus = "";

    if(message.status == "RB"){
        rideStatus = ongoingString;
    }
    if(message.status == "R"){
        rideStatus = lateBeginString;
    }
    if(message.status == "RE"){
        rideStatus = closedString;
    }

    var ride = { id: message.ride_id,
        provider:message.provider,
        ride_status: rideStatus,
        begin_at: message.collected_at,
        end_at: message.collected_at,
        data: {
            beginPosition: message.loc,
            endPosition: message.loc,
            ride_status: rideStatus
        },
        distance_meters: 0,
        num_positions: 1};

    if(message.mobile_id){
        ride["mobile_id"] = message.mobile_id;
    }

    logger.info("Ride:",ride.id);

    ride.data.error = setRideStatus(ride.distance_meters,ride.num_positions);
    ride.ride_status = ride.data.ride_status + ride.data.error;

    AccessOprtDB.insertRide(ride, function (err, res) {

        if (err) {
            logger.log("rideShareProcessor: New Ride error saving message", err);

            logger.debug("rideShareProcessor: New Ride error saving message");
            logger.debug("RIDE Inserted ERROR:",err);

            return callback(err,null);
        }
        logger.log("rideShareProcessor: New Ride message saved!");
        logger.debug("RIDE Inserted:",ride.id);

        return callback(null,res);
    });
}


var closeOldsRides = function(message,callback){


    findRideByLatest(message,function(err,ride) {

        logger.debug("RideTOClose:",ride,err);
        if(err|| !ride) {
            return callback(err,ride);
        }

        var cpf = message.cpf;
        delete  message.cpf;



        ride[0].beginposition_location = "("+ride[0].data.beginPosition.lat+","+ ride[0].data.beginPosition.lng+")";
        ride[0].endposition_location = "("+ride[0].data.endPosition.lat+","+ ride[0].data.endPosition.lng+")";

        ride[0].data.error = setRideStatus(ride[0].distance_meters,ride[0].num_positions);
        ride[0].data.ride_status = closedTimeOutSring;

        ride[0].ride_status = ride[0].data.ride_status+ride[0].data.error;


        AccessOprtDB.updateRide(ride[0], function (err, res) {
            if(err){
                return callback(err,null);
            }
            return Consolidate.buildConsolidate(ride[0],cpf,callback);

        });
    });
};

var findRideByLatest = function (obj,callback) {

    AccessOprtDB.findLatest(obj.mobile_id, function(err,rides){
        if(err){

            return callback(err,null);
        }
        AccessOprtDB.findRide(rides[0].ride_id,function(err,ride){
            if(err|| ride.length == 0){
                return callback(err,null);
            }
            if(ride[0].ride_status.substr(0,7) == ongoingString){
                return callback(null,ride);
            }
            return callback(null,null);
        });
    });
};

var setRideStatus = function (distance_meters,num_positions) {

    var ride_status = '';

    if(distance_meters < 100){
        ride_status = ride_status.concat(shortRideString);
    }
    if(num_positions < 3){
        ride_status = ride_status.concat(fewPositionsString);
    }

    return ride_status;
}

module.exports = Ride;
