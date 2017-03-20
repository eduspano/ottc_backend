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

 File: position_util.js
 Authors:  Andre Yai
 Date: 2016-08-29
 */

var positionUtil = {};

var TO_RAD = Math.PI / 180;
var RADIUS = 6378137; //meters

function toRad(value) {
    return value * TO_RAD;
}


positionUtil.calculateDistanceSimple = function(start, end){

    var sin = Math.sin(toRad(end.lat)) * Math.sin(toRad(start.lat));
    var cos = Math.cos(toRad(end.lat)) * Math.cos(toRad(start.lat))*Math.cos(toRad(start.lng) - toRad(end.lng));
    var distance =  Math.acos(Math.min(1.0, sin+cos)) * RADIUS;

    return Math.round(distance);

};

module.exports = positionUtil;