"use strict";
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

 File: agency.js
 Authors:  Julian Monteiro
 Date: 2016-06-18
 */
var logger = require('log4js').getLogger('agency');

var _ = require("underscore");

var Agency = function(doc) {

    this.agency_id = doc.agency_id;
    this.timezone = doc.agency_timezone;
    this.provider = doc.provider;
    this.active = doc.active;
    this.service = doc.service;

    logger.debug("Creating Agency: "+this.agency_id+" / "+this.provider+" tz:"+this.timezone);
};

module.exports = Agency;

