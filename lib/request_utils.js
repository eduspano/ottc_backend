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

 Express response helpers

 File: request_utils.js
 Authors:  Julian Monteiro
 Date: 2017-03-13
 */

//Send Response to API CALL
var sendResponseOk = function(response, message, body) {
    var content = {
        status:"ok",
        message:message
    };

    if (typeof body !== 'undefined') {
        content.body = body;
    }

    response.status(200).send(content);
};

var sendResponseError = function(response, message){
    response.status(200).send({status:"error", message:message});
};

module.exports = {
    sendResponseOk:sendResponseOk,
    sendResponseError:sendResponseError
}