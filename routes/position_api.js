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

 File: position_api.js
 Authors: Julian Monteiro
 Date: 2017-03
 */

var express = require('express');
var controller = require('../controllers/receiver');

var router = express.Router();

/**
 * @apiDefine PositionGroup position APIs
 */

/**
 * @api {POSt} /position Send device position
 * @apiName AddPosition
 * @apiGroup PositionGroup
 *
 *
 * @apiParam {String} user_id user id
 * @apiParam {String} mobile_id random id (one per day)
 * @apiParam {String} ride_id ride id
 * @apiParam {String} status (W|RB|R|RE)
 * @apiParam {String} provider (uber|99|cabify|...)
 * @apiParam {String} service  rideshare
 * @apiParam {Number} lat  latitude
 * @apiParam {Number} lng  longitude
 * @apiParam {Date} ts  ISO 8601 date (ex. YYYY-MM-DDTHH:mm:ss.sssZ)
 *
 * @apiExample Example usage:
 * curl --data 'mobile_id=lalala42&user_id=77777777777&provider=uber&status=RE&agency=saopaulo_sp&service=rideshare&lat=-23.5672&lng=-46.69754&ts=2017-02-07T04:12:02Z&ride_id=adsf-1234' http://127.0.0.1:4200/position
 * curl --data 'mobile_id=lalala42&user_id=77777777777&provider=uber&status=RE&agency=saopaulo_sp&service=rideshare&lat=-23.5772&lng=-46.69554&ts=2017-02-07T04:13:02Z&ride_id=asdf-1234' http://127.0.0.1:4200/position
 * curl --data 'mobile_id=lalala42&user_id=77777777777&provider=uber&status=RE&agency=saopaulo_sp&service=rideshare&lat=-23.5572&lng=-46.69354&ts=2017-02-07T04:14:02Z&ride_id=asdf-1234' http://127.0.0.1:4200/position
 *
 * @apiUse ApiResponseEnvelope
 *
 * @apiUse ApiAuthRequiredError
 */
router.post('/', controller.processRequest);

module.exports = router;