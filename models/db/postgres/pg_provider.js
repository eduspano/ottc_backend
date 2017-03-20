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

 File: pg_provider.js
 Authors: Andre Yai
 Date: 2016-12-21

 Manages operations on table Providers - rideshare Companies
 */

var db = require('./pg_setup').db;
var ProviderOperation = {};

ProviderOperation.findProviderList = function(next) {

    db.query('SELECT * FROM ride_provider;')
        .then(function (result) {
            next(null,result);
        })
        .catch(function (err) {
            return next(err,null);
        });
};

ProviderOperation.findProviderWithName = function(name, next) {

    db.one('SELECT * FROM ride_provider where name = $1;',name)
        .then(function (result) {
            next(null,result.data);
        })
        .catch(function (err) {
            return next(err,null);
        });
};


ProviderOperation.insertProviderList = function (obj,cbk) {

    db.none("INSERT INTO ride_provider values ($1)",[obj])
        .then(function(){
            return cbk(null,"ok");
        })
        .catch(function (err) {
            return cbk(err,null);
        });
};


module.exports = ProviderOperation;