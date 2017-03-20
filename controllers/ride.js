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

 File: ride.js
 Authors:  Andre Yai
 Date: 2016-08-13
 */
var logger = require('log4js').getLogger('ride');

var AccesOprt = require('./../models/db/postgres/iot_db_post_accessOprt');


var Controller = {};

Controller.deleteRide = function(req,res) {
    logger.info("deleting ride_id:", rideID);

    var rideID = req.params.ride_id;
    if (!rideID) {
        res.status(200).send({status: "error", message: "Não foi possivel remover a corrida."});
        return;
    }

    AccesOprt.deleteRide(rideID, function(err,ride){
        logger.info("deleted ride:", ride);

        if(ride){
            res.status(200).send({status:"ok", message: "Corrida removida com sucesso."});
        }
        else{
            res.status(200).send({status:"error", message: "Não foi possivel remover a corrida."});
        }
    });
};

module.exports = Controller;



