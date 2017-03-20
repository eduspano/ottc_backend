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

 File: app.js
 Authors: Roberto Speicys, Julian Monteiro
 Date: 2016-06
 */

var logger = require('log4js').getLogger('receiver/app');


var express = require('express');
var bodyParser = require('body-parser');
var http = require('http');
var routes_api = require('./../routes/api');
var passport = require('passport');
var path = require('path');
var session = require('express-session');
var nodemailer = require('nodemailer');

var config = require("../lib/config");

var userController = require("../controllers/user.js");

var app = express();

app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'jade');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());
//app.use(passport.session());


// REGISTER OUR ROUTES -------------------------------
app.use('/api/v1', routes_api);

app.post('/user/reset/:token', userController.changePassword);
app.get('/user/reset/:token', userController.getResetPage);


module.exports = app;