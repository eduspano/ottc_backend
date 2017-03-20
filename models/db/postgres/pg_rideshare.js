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

 File: pg_rideshare.js
 Authors: Andre Yai
 Date: 2016-12-21

 Operations on users table. In this file we have functions that helps to login, signup,resetPassword
 */

var EnvSetUP = require('./pg_setup');

var db =  EnvSetUP.db;
var RideshareOperation = {};
var ongoingString = "ONGOING";
var lateBeginString = "ONGOING_LATEBEGIN";


//TODO: This file should only have queries;

//DB Queries on Postgres for Rides;
RideshareOperation.upsertLatest = function (obj,callback) {

	db.none("WITH upsert AS (UPDATE latest SET data = ${this}, ride_id = ${ride_id}, provider = ${provider}, stored_at = ${stored_at}, collected_at = ${collected_at} ,position_location = ${point} WHERE mobile_id = ${mobile_id} RETURNING *) INSERT INTO latest (mobile_id, ride_id, provider, data,stored_at,collected_at,position_location) SELECT  ${mobile_id}, ${ride_id}, ${provider},${this},${stored_at},${collected_at},${point} WHERE NOT EXISTS (SELECT * FROM upsert);",obj)
		.then(function(){
			callback(null,obj);
		})
		.catch(function (err) {
			return callback(err,null);
		})
};

RideshareOperation.findLatest = function(id, callback){

	db.query("Select * from latest where mobile_id = $1;",[id])
		.then(function(obj){
			callback(null,obj);
		})
		.catch(function (err) {
			return callback(err,null);
		})
};

//DB Queries on Postgres for Positions
RideshareOperation.insertPosition = function (obj,callback) {

	db.none("INSERT INTO positions (mobile_id,ride_id,provider,data,position_location,collected_at,stored_at) VALUES (${mobile_id},${ride_id},${provider},${this},${point},${collected_at},${stored_at});",obj)
		.then(function(){
			callback(null,obj);
		})
		.catch(function (err) {
			return callback(err,null);
		});
}


//DB Query on Postgres for Ride
RideshareOperation.insertRide = function (obj,callback) {

	var point = "("+obj.data.beginPosition.lat+","+ obj.data.beginPosition.lng+")";

	obj["point"] = point;

	console.log("NEW RIDE INSERT:",obj.id);
	db.none("INSERT INTO rides (mobile_id,id,ride_status,provider,data,begin_at,end_at,beginPosition_location,endPosition_location,num_positions,distance_meters) VALUES (${mobile_id},${id},${ride_status},${provider},${data},${begin_at},${end_at},${point},${point},${num_positions},${distance_meters});", obj)
		.then(function(){
			callback(null,obj);
		})
		.catch(function (err) {
			return callback(err,null);
		})
};

RideshareOperation.findRide = function (ride_id,callback) {

	db.query("SELECT * FROM rides WHERE (id = $1);", ride_id)
		.then(function(res){
			console.log("Find Ride!");
			callback(null,res);
		})
		.catch(function (err) {
			return callback(err,null);
		})
};

//Todo: This will be removed and turned into one for findLatest and other to findRide;

RideshareOperation.updateRide = function (obj,callback) {
	console.log("UPDATERIDE");
	db.none("UPDATE rides SET ride_status = ${ride_status}, data = ${data}, endposition_location = ${endposition_location}, num_positions = ${num_positions},distance_meters = ${distance_meters} WHERE id = ${id};",obj)
		.then(function(){
			return callback(null,obj);
		})
		.catch(function (err) {
			return callback(err,null);
		})
};

RideshareOperation.deleteRide = function (rideID,callback) {

	db.one("SELECT * FROM rides WHERE id = $1;", String(rideID))
		.then(function(result){
			if (result) {
				var data = result.data;
				data["deleted_by_user"] = 1;
				db.none("UPDATE rides SET data = $1 WHERE id = $2;", [data, rideID])
					.then(function(){
						callback(null, true);
					})
					.catch(function (err){
						callback(null, false);
					});
			}
		})
		.catch(function (err){
			callback(null, false);
		});
};


//TODO: This will be a function in ride;

RideshareOperation.insertConsolidateUserDay = function(consolidate_insert,cbk){

	db.none("Insert INTO CONSOLIDATE_USER_DAY (cpf,day,num_rides,total_km,data,date) values (${cpf},${day},${num_rides},${total_km},${data},${date});", consolidate_insert)
		.then(function() {
			console.log("Saved in consolidate");
			return cbk(null, "ok");
		})
		.catch(function (err) {
			return cbk(err,null);
		})
};

RideshareOperation.updateConsolidateUserDay = function(consolidate_update,cbk){


	db.none("UPDATE CONSOLIDATE_USER_DAY set num_rides = ${num_rides} ,total_km = ${total_km}, data = ${data} WHERE cpf = ${cpf} and date = ${date};",consolidate_update)
		.then(function() {
			console.log("Consolidate Update");
			return cbk(null,"ok");
		})
		.catch(function (err) {
			return cbk(err,null);
		})
};

RideshareOperation.findConsolidateUserDay = function(cpf,dayStr,cbk){

	db.query("Select * from CONSOLIDATE_USER_DAY where cpf = $1 and date = $2;", [cpf,dayStr])
		.then(function(result){
			return cbk(null,result);
		})
		.catch(function(err){
			return cbk(err,null);
		});
};

RideshareOperation.deleteRideBYID = function(ride_id){
	db.none("Delete from rides where id = $1;",ride_id)
		.then(function(result){
			return cbk(null,result);
		})
		.catch(function(err){
			return cbk(err,null);
		})
}

module.exports = RideshareOperation;
