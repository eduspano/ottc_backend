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

 File: pg_access_token.js
 Authors: Andre Yai
 Date: 2016-12-21
 */


/**
 *   Operations on users table. In this file we have functions that helps to login, signup,resetPassword
 */
var logger = require('log4js').getLogger('pg_access_token');

var EnvSetUP = require('./pg_setup');
var db =  EnvSetUP.db;

var Operation = {};

Operation.findByToken = function(token, callback){

    db.one("SELECT * FROM access_token WHERE token = $1;", [token])
        .then(function(result){
            logger.debug("findByToken: ",result);
            callback(null,result);
        })
        .catch(function (err){
            logger.error("Error findByToken:",err);
            callback(err, null);
        })
};

Operation.saveToken = function(user_id, token, callback){

    db.none("INSERT INTO access_token (user_id,token) VALUES ($1,$2);", [user_id,token])
        .then(function(result){
            callback(null,result);
        })
        .catch(function (err){
            logger.error("Error saveToken:",err);
            callback(err, null);
        })
};

module.exports = Operation;