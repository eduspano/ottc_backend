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

 File: initial_providers.js
 Authors: Julian Monteiro
 Date: 2017-03-01
 */
var config = require("../lib/config");


exports.seed = function(knex, Promise) {

  /*** Atenção *** - remove tabela ride_provider e reinsere dados */

  var imageProviderUrl = "http://"+config.receiver.host+"/api/v1/provider/logo";

  return knex('ride_provider').del()
    .then(function () {
      return Promise.all([
        knex('ride_provider').insert({name: '99', data:{name: '99', url:"imagesProvider/icone_99.png", logoUrl:imageProviderUrl+"/icone_99.png"}}),
        knex('ride_provider').insert({name: 'easytaxi', data:{name: 'easytaxi',url:"imagesProvider/icone_easytaxi.png", logoUrl:imageProviderUrl+"/icone_easytaxi.png"}}),
        knex('ride_provider').insert({name: 'uber', data:{name: 'uber', url:"imagesProvider/icone_uber.png", logoUrl:imageProviderUrl+"/icone_uber.png"}}),
        knex('ride_provider').insert({name: 'cabify', data:{name: 'cabify', url:"imagesProvider/icone_cabify.png", logoUrl:imageProviderUrl+"/icone_cabify.png"}}),
      ]);
    });

};

