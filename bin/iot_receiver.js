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

 Receiver - node.js, express (see config file for options)

 Authors:  Roberto Speicys, Julian Monteiro
 Date: 2016-11-10
 */

var logger = require('log4js').getLogger('iot_receiver');

var config = require("../lib/config");

var app = require("../receiver/app");

//
// === CREATE SERVER ===
//
app.set('port', config.receiver.port);

//
// === START THE SERVER ===
//
logger.info("Starting server on port --( "+config.receiver.port+" )--");
app.listen(config.receiver.port, function() {
    logger.info("OTTC backend started and running...");
});