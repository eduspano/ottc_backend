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

 Utils

 File: utils.js
 Authors: Andre Yai
 Date: 2016-11-24
 */


/**
 * Manage Access to Postgres;
 */

var RideshareOpr = require('./pg_rideshare');


var AccessOprt = {};

//FIND
AccessOprt.findRide = function(ride_id,callback) {
   return RideshareOpr.findRide(ride_id,callback);
};


AccessOprt.findLatest = function (id,callback){
    return RideshareOpr.findLatest(id,callback);
};


//INSERT
AccessOprt.insertRide = function(ride,callback) {
   return RideshareOpr.insertRide(ride, callback);
};

AccessOprt.updateRide = function(ride,callback) {
    return RideshareOpr.updateRide(ride,callback);
};

//Delete Ride
AccessOprt.deleteRide = function(rideId,callback) {
    return RideshareOpr.deleteRide(rideId,callback);
};
AccessOprt.deleteRideBYID = function(rideId,callback){
    return RideshareOpr.deleteRideBYID(rideId,callback);
};



module.exports = AccessOprt;