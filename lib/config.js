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

 * Read settings file (development|production)

 File: config.js
 Authors:  Julian Monteiro
 Date: 2016-06-18
 */
var logger = require('log4js').getLogger('config');

var node_env = process.env.NODE_ENV || 'development';
logger.info("environment: ",node_env);

var config = {};

try {
    config = require("../config/config." + node_env + ".js");
} catch (err) {
    logger.warn("Config: file not found: config." + node_env + ".js, using default" );
    config = require("../config/config.global.js");
}

config.env = node_env;

//logger.debug("config ",config);

module.exports = config;