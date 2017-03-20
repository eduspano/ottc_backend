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

 File: api.js
 Authors: Julian Monteiro
 Date: 2017-03
 */
var express = require('express');
var router = express.Router();

// --- Position:
// POST /api/v1/position (insere na fila, nao processa na hora)

// --- Users:
// POST /api/v1/user/signup
// POST /api/v1/user/login
// POST /api/v1/user/update
// POST /api/v1/user/resetpassword
// POST /api/v1/user/reset/:token
// GET  /api/v1/user/reset/:token

// --- Providers:
// GET /api/v1/provider  #(devolve lista de providers)
// GET /api/v1/provider/logo/:image  #(devolve imagem do provider)

// --- Rides:
// DELETE /api/v1/ride/{ride_id}

router.use('/position', require('./position_api'));
router.use('/ride', require('./ride_api'));
router.use('/user', require('./user_api'));
router.use('/provider', require('./provider_api'));

module.exports = router;
