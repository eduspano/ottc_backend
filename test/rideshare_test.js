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

 File: rideshare_test.js
 Authors: Julian Monteiro
 Date: 2017-01-28
 */
var logger = require('log4js').getLogger('rideshare_test');

var assert = require('assert');
var http = require('http');

var _t = require("./base_test");

var APIPATH = "/api/v1/";

var RideshareOpr = require("./../models/db/postgres/pg_rideshare.js");

_t.runServer(function(err) {
    console.log("server running");
});

var message = {
    //user_id: '06323739895',
    name: 'Ottc_test',
    password: '123456',
    gender: 'M',
    cpf: '06323739895',
    email: 'ottc@teste.com'
};

var message_positions = {

    user_id: '06323739895',
    mobile_id: 'asdf1234',
    provider: 'ottc',
    status: 'RB',
    battery: '100',
    agency: 'saopaulo_sp',
    service: 'rideshare',
    ride_id: '8s',
    ts: '2017-01-16T17:59:13.761Z',
    lat: '-23.43253',
    lng: '-46.787073'
};

describe('Rides API', function () {

    before(function (done) {
        this.timeout(3000);
        _t.cleanSchema(done);
    });

    it('Test USERS API:should allow user sign_up', function (done) {

        _t.requestPOST(APIPATH+'/user/signup', message, function (err, res) {
            console.log("Response body:", res.body);
            assert.equal(res.body.status, 'ok');
            assert(res.body.message.access_token);
            done();
        });
    });

    it('Test Rides API:should create new Ride1', function (done) {

        _t.requestPOST(APIPATH+'/position', message_positions, function (err, res) {
            console.log("Response body:", res.body);
            assert.equal(res.body.status, 'ok');
            done();
        });
    });

    //TODO: Should check on DB latest, rides, positions

    it('Test Rides API:should create new Ride2', function (done) {
        _t.requestPOST(APIPATH+'/position', message_positions, function (err, res) {
            console.log("Response body:", res.body);
            assert.equal(res.body.status, 'ok');
            done();
        });
    });

    it('DB: test latest', function (done) {

        RideshareOpr.findLatest(message_positions.mobile_id, function (err, data) {
            console.log("Find Latest:", err, data);

            RideshareOpr.findRide(message_positions.ride_id, function (err, data) {
                console.log("Params:", err, data);

                assert.equal(data[0].id, '8s');
                assert.equal(data[0].ride_status, "ONGOING_SHORT_FEW");
                assert.equal(data[0].mobile_id, "asdf1234");

                //Check parameters Ongoing
                done();
            });
        });

    });

    //TODO:Calculate Distance 
    it('API RIDES: should update Ride', function (done) {

        message_positions.lat = "-23.432481";
        message_positions.lng = "-46.787081";
        message_positions.status = 'R';

        _t.requestPOST(APIPATH+'/position', message_positions, function (err, res) {
            console.log("Params:", res.body);
            assert.equal(res.body.status, 'ok');

            RideshareOpr.findRide(message_positions.ride_id, function (err, data) {
                console.log("Params:", err, data);

                assert.equal(data[0].id, '8s');
                assert.equal(data[0].ride_status, "ONGOING_SHORT_FEW");
                assert.equal(data[0].mobile_id, 'asdf1234');
                assert.equal(data[0].distance_meters, '6');

                //Check parameters Ongoing
                done();
            });
        });
    });

    it('API RIDES: should update Ride', function (done) {

        message_positions.lat = "-23.432175";
        message_positions.lng = "-46.787116";
        message_positions.status = 'R';

        _t.requestPOST(APIPATH+'/position', message_positions, function (err, res) {
            console.log("Params:", res.body);
            assert.equal(res.body.status, 'ok');
            RideshareOpr.findRide(message_positions.ride_id, function (err, data) {
                console.log("Params:", err, data);

                assert.equal(data[0].id, '8s');
                assert.equal(data[0].ride_status, "ONGOING_SHORT");
                assert.equal(data[0].mobile_id, 'asdf1234');
                assert.equal(data[0].distance_meters, '40');

                //Check parameters Ongoing
                done();
            });
        });
    });

    it('API RIDES: should update Ride', function (done) {

        message_positions.lat = "-23.432118";
        message_positions.lng = "-46.787122";
        message_positions.status = 'R';

        _t.requestPOST(APIPATH+'/position', message_positions, function (err, res) {
            console.log("Params:", res.body);
            assert.equal(res.body.status, 'ok');

            RideshareOpr.findRide(message_positions.ride_id, function (err, data) {
                console.log("Params:", err, data);

                assert.equal(data[0].id, '8s');
                assert.equal(data[0].ride_status, "ONGOING_SHORT");
                assert.equal(data[0].mobile_id, 'asdf1234');
                assert.equal(data[0].distance_meters, '46');

                //Check parameters Ongoing
                done();
            });

        });
    });

    it('Test Rides API:should close new Ride', function (done) {

        message_positions.status = "RE";
        message_positions.lat = "-23.431505";
        message_positions.lng = "-46.78719";

        _t.requestPOST(APIPATH+'/position', message_positions, function (err, res) {
            console.log("Params:", res.body);
            assert.equal(res.body.status, 'ok');
            done();
        });
    });
    it('Test Rides API:should waitting', function (done) {
        message_positions.status = "W";
        message_positions.ride_id = 'none';
        _t.requestPOST('/position', message_positions, function (err, res) {
            console.log("Params:", res.body);
            assert.equal(res.body.status, 'ok');
            done();
        });
    });

    it('DB: test rides closed', function (done) {

        RideshareOpr.findRide("8s", function (err, data) {
            console.log("Rides2:", err, data);
            assert.equal(data[0].id, '8s');
            assert.equal(data[0].ride_status, "CLOSED");
            assert.equal(data[0].distance_meters, '115');
            assert.equal(data[0].mobile_id, 'asdf1234');
            done();
        });

    });

    it('Test Rides API:should waitting', function (done) {
        message_positions.status = "W";
        message_positions.ride_id = 'none';
        _t.requestPOST(APIPATH+'/position', message_positions, function (err, res) {
            console.log("Params:", res.body);
            assert.equal(res.body.status, 'ok');
            done();
        });
    });
    it('DB: test rides closed', function (done) {

        RideshareOpr.findRide("8s", function (err, data) {
            console.log("Rides2:", err, data);
            assert.equal(data[0].id, '8s');
            assert.equal(data[0].ride_status, "CLOSED");
            assert.equal(data[0].mobile_id, 'asdf1234');
            done();
        });

    });
});


// it('DB: delete ride',function(done){
//     postOpt.deleteRideBYID('8s',function(err,data){
//         done();
//     });
// })


// Rides API - CASO 2 RB with differents rides.

// it('Test Rides API:should create new Ride', function (done) {

//     message_positions.status = 'RB';
//     message_positions.ride_id = '9s';

//     _t.requestPOST('/position', message_positions, function (err, res) {
//         console.log("Params:", res.body);
//         assert.equal(res.body.status, 'ok');
//         done();
//     });
// });

// it('DB: test rides', function (done) {
//     setTimeout(function () {
//         postOpt.findRide('9s', function (err, data) {
//             console.log("Params:", err, data);

//             assert.equal(data[0].id, '9s');
//             assert.equal(data[0].ride_status, "ONGOING_SHORT_FEW");
//             assert.equal(data[0].mobile_id, '06323739895');

//             //Check parameters Ongoing
//             done();
//         });
//     }, 1500);
// });

// //TODO: Should check on DB latest, rides, positions
// it('Test Rides API:should create new Ride', function (done) {

//     message_positions.ride_id = '10s';
//     _t.requestPOST('/position', message_positions, function (err, res) {
//         console.log("Params:", res.body);
//         assert.equal(res.body.status, 'ok');
//         done();
//     });
// });

// it('DB: test rides', function (done) {
//     setTimeout(function () {
//         postOpt.findRide(message_positions.ride_id, function (err, data) {
//             console.log("Params:", err, data);

//             assert.equal(data[0].id, '10s');
//             assert.equal(data[0].ride_status, "ONGOING_SHORT_FEW");
//             assert.equal(data[0].mobile_id, '06323739895');

//             //Check parameters Ongoing
//         });
//         postOpt.findRide('9s', function (err, data) {
//             console.log("Params:", err, data);

//             assert.equal(data[0].id, '9s');
//             assert.equal(data[0].ride_status, "CLOSED_TIMEOUT_SHORT_FEW");
//             assert.equal(data[0].mobile_id, '06323739895');
//             //Check parameters Ongoing
//             done();
//         });
//     }, 1500);
// });

// it('Test Rides API:should be Waitting.', function (done) {

//     message_positions.status = "W";
//     message_positions.ride_id = "none";

//     _t.requestPOST('/position', message_positions, function (err, res) {
//         console.log("Params:", res.body);
//         assert.equal(res.body.status, 'ok');
//         done();
//     });
// });

// //TODO: Should check on DB latest, rides, positions
// it('Test Rides API:should Waitting.', function (done) {
//     _t.requestPOST('/position', message_positions, function (err, res) {
//         console.log("Params:", res.body);
//         assert.equal(res.body.status, 'ok');
//         done();
//     });
// });

// it('DB: test rides', function (done) {
//     setTimeout(function () {
//         postOpt.findRide('10s',function (err, data) {
//             console.log("Params:", err, data);

//             assert.equal(data[0].id, '10s');
//             assert.equal(data[0].ride_status, "CLOSED_TIMEOUT_SHORT_FEW");
//             assert.equal(data[0].mobile_id, '06323739895');
//             done();
//             //Check parameters Ongoing
//         });
//     },1500);
// });
// it('DB: delete ride',function(done){
//     postOpt.deleteRideBYID('10s',function(err,data){
//         deleteRideBYD('10s',function(err,data){
//             deleteRideBYD('9s',function(err,data){

//             })
//         })
//         done();
//     });
// })
//
//});