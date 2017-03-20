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

 File: base_test.js
 Authors: Julian Monteiro
 Date: 2017-01-28
 */
var logger = require("log4js").getLogger("base_test");
var request = require('supertest');

// *** Ensure test environment ***
process.env.NODE_ENV = "test";

var config = require ("../lib/config");

var knex = require('../lib/db_knex');


var pgsetup = require('../models/db/postgres/pg_setup');
var db = pgsetup.db;

var app = require("../receiver/app");

function cleanSchema(callback) {
        logger.debug("cleanSchema - rollback");
        knex.migrate.rollback()
            .then(function(err) {

                logger.debug("cleanSchema - latest ",err);
                return knex.migrate.latest();

            })
            .then(function(err) {

                logger.debug("cleanSchema - seed.run",err);
                return knex.seed.run();

            })
            .then(function(err) {

                logger.debug("cleanSchema - finished",err);
                callback();

            });
}


function runServer(callback) {
    app.listen(config.receiver.port, function (err) {
        callback(err);
    });
}
//
// function cleanDbAndRunServer(callback) {
//     cleanSchema(function(err) {
//         if (err) {
//             return callback(err);
//         }
//         runServer(callback);
//     })
// }


function requestPOST(endpoint, message, callback) {
    var host = 'http://localhost:'+config.receiver.port;
    request(host)
        .post(endpoint)
        .send(message)
        .end(callback);
}

function requestGET(endpoint, callback) {
    var host = 'http://localhost:'+config.receiver.port;
    request(host)
        .get(endpoint)
        .end(callback);
}


module.exports = {
    app: app,
    db: db,
    cleanSchema: cleanSchema,
    runServer: runServer,
    requestPOST: requestPOST,
    requestGET: requestGET
};