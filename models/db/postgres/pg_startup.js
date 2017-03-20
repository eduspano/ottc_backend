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

 File: pg_setup.js
 Authors: Andre Yai
 Date: 2016-12-01
 */
var logger = require('log4js').getLogger('pg_startup');

var Url = require("url");

var async = require('async');
var db = require('./pg_setup').db;

var config = require("../../../lib/config");

//RESPONSAVEL PELA CRIAÇAO DAS TABELAS;
var dbSchema = config.db.schema;

var dbName = Url.parse(config.db.url).pathname.substr(1);
var dbAuth = Url.parse(config.db.url).auth.split(":");
var dbUser = dbAuth[0];

logger.info("db_schema:",dbSchema);
var creatingTablesPOSTGRES = function (callback){

    logger.info("Creating DB SCHEMA and TABLES: ",dbSchema);

    var array = [
        "CREATE SCHEMA IF NOT EXISTS "+dbSchema+";",
        "SET search_path = "+dbSchema+";",

        "ALTER ROLE "+dbUser+" IN DATABASE "+dbName+" SET search_path = "+dbSchema+",public;",

        "CREATE  TABLE IF NOT EXISTS users (email text UNIQUE NOT NULL, " +
        "cpf text UNIQUE NOT NULL, _id serial, data jsonb);",

        "CREATE  INDEX IF NOT EXISTS idxUserEmail ON users (email);",
        "CREATE  INDEX IF NOT EXISTS idxUserCPF ON users (cpf);",
        "CREATE  INDEX IF NOT EXISTS idxUserReset ON users ((data->>'resetPasswordToken'));",

        "CREATE  TABLE IF NOT EXISTS rides (id text NOT NULL, ride_status text NOT NULL , " +
        " mobile_id text,provider text, _id serial, data jsonb,stored_at timestamp, collected_at timestamp, end_at timestamp, begin_at timestamp," +
        "distance_meters float, num_positions int, beginposition_location point, endposition_location point);",

        "CREATE  INDEX IF NOT EXISTS idxRideId ON  rides (id);",
        "CREATE  INDEX IF NOT EXISTS idxRideRideStatus ON  rides (ride_status);",
        "CREATE  INDEX IF NOT EXISTS idxRidesStatus ON rides  ((data->>'ride_status'));",
        "CREATE  INDEX IF NOT EXISTS idxridesEndAt ON rides  ((data->>'endAt'));",
        "CREATE  INDEX IF NOT EXISTS idxridesID ON rides  ((data->>'id'));",

        "CREATE  TABLE IF NOT EXISTS positions (ride_id text  NOT NULL, mobile_id text NOT NULL,  data jsonb, stored_at timestamp," +
        " collected_at timestamp, position_location point);",

        "CREATE  INDEX IF NOT EXISTS idxRideRideId ON positions (ride_id);",
        "CREATE  TABLE IF NOT EXISTS latest (mobile_id text,  data jsonb, ride_id text, provider text," +
        " position_location point, stored_at timestamp, collected_at timestamp);",
        "CREATE  INDEX IF NOT EXISTS idxLatestMobileId ON latest (mobile_id);",

        "CREATE  TABLE IF NOT EXISTS rideprovider (data jsonb);",

        "CREATE TABLE IF NOT EXISTS  CONSOLIDATE_USER_DAY (cpf text not null, day text, date timestamp ,num_rides int ,total_km float,data jsonb);",

        "CREATE  INDEX IF NOT EXISTS idxConsoledateCPF ON  CONSOLIDATE_USER_DAY  (cpf);",
        "CREATE  INDEX IF NOT EXISTS dayConsolidateCollected ON  CONSOLIDATE_USER_DAY (day);",
        "CREATE  INDEX IF NOT EXISTS dateConsolidateCollected ON  CONSOLIDATE_USER_DAY (date);",


        "CREATE TABLE IF NOT EXISTS watch_latest (day text);",
        "CREATE  INDEX IF NOT EXISTS idxDate ON  watch_latest  (day);"

    ];

    async.eachSeries(array,function(operation,cbk){
        db.none(String(operation))
            .then(function(){
                cbk(null,null);
            })
            .catch(function (err) {
                cbk(err,null);
            });
        },
        function(err,data){
            if(err) {
                console.error(err);
            }
            else{
                console.log("TABELAS Created!");
            }
            callback(err,data);
        } 
    );
}

module.exports = function(cbk) {


    db.none("SET search_path = "+dbSchema+";")
        .then(function(row){
            db.one("SELECT EXISTS (SELECT 1 FROM  information_schema.tables WHERE "+
                "tables.table_name = 'users' AND table_schema= '"+dbSchema+"') AND "+
                "EXISTS ( SELECT 1 FROM  information_schema.tables WHERE "+
                "tables.table_name = 'rides' AND table_schema= '"+dbSchema+"') AND "+
                "EXISTS ( SELECT 1 FROM  information_schema.tables WHERE "+
                "tables.table_name = 'latest' AND table_schema= '"+dbSchema+"') AND "+
                "EXISTS ( SELECT 1 FROM  information_schema.tables WHERE "+
                "tables.table_name = 'positions' AND table_schema= '"+dbSchema+"');")

                .then(function(row){

                    if(row["?column?"] == false){
                        creatingTablesPOSTGRES(cbk);
                    }
                    else{
                        logger.info("tables ok");

                        cbk(null,null);
                    }
                })
                .catch(function (err) {
                    cbk(err,null);
                });
        })
        .catch(function (err) {
            cbk(err,null);
        });

};

