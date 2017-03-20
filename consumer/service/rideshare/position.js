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


var Position = {};

var RideshareOpr = require('../../../models/db/postgres/pg_rideshare');

var logger = require('log4js').getLogger('position');

Position.insertNewPosition = function(message, cbk){

    //Position insert;
    logger.debug("insertNewPosition: ", message);

    RideshareOpr.insertPosition(message, function (err, res) {
        if (err) {
            logger.error("rideShareProcessor: positionsDAO error saving message", err);
        } else {
            logger.log("rideShareProcessor: positionsDAO message saved! ");
        }
        cbk(err,res);
    });
};

module.exports = Position;