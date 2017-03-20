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

 File: user_test.js
 Authors: andrey
 Date: 2016-09-05
 */
var assert = require('assert');

var _t = require("./base_test");

var UsersOpr = require("./../models/db/postgres/pg_users.js");

var UserController = require("./../controllers/user");

var APIPATH = "/api/v1/user";

var message = {
   user_id: '1',
   name: 'Ottc_test',
   password: '123456',
   gender: 'M',
   cpf: '43200010010',
   email: 'ottc@teste.com'
};

_t.runServer(function(err) {
    console.log("server running");
});

describe('Test Users DB - create, find and delete scenario', function () {

   before(function(done) {
       _t.cleanSchema(done);
   });

    it("user should not be found", function (done) {
        UsersOpr.findUserByUserId(message.user_id, function (err, data) {
            assert(!err);
            assert(!data);
            done();
        });
    });


    it('DB:save user', function (done) {
        UsersOpr.saveUser(message, function (err, data) {
            assert(!err);
            assert.equal(err, null);
            assert.equal(data.cpf, message.cpf);
            assert.equal(data.name, message.name);
            assert.equal(data.gender, message.gender);
            assert.equal(data.user_id, message.user_id);
            done();
        });
    });

    it("DB:find user should return one the user", function (done) {
        UsersOpr.findUserByUserId(message.user_id, function (err, data) {
            assert(!err);
            assert(data);
            console.log("Found:", data);
            assert.equal(data.data.cpf, message.cpf);
            done();
        });
    });

    it("DB:should delete user", function (done) {
        UsersOpr.deleteUser(message.user_id, function (err,user) {
            assert(!err);
            assert(!user);
           done();
       });
   });

   it("DB:find user should be none existent", function (done) {
       UsersOpr.findUserByUserId(message.user_id, function (err, data) {
           assert(!err);
           assert(!data);
           done();
       });
   });
});


describe('Test Users API', function () {

    before(function(done) {
        _t.cleanSchema(done);
    });


    it('should not create user wrong email', function (done) {
       console.log("\n Should not create user wrong email\n");

       message["email"] = "yai.andr@gm";

       _t.requestPOST(APIPATH+'/signup',message,function (err, res) {
               console.log("res.res.body", res.res.body);

               assert.equal(res.res.body.status,"error");
               assert.equal(res.res.body.message, "Erro nos parametros: Campo e-mail não contém um endereço válido");

               done();
           });
   });

   it('API TEST: should create user', function (done) {
       console.log("\n Should create user\n");

       message.cpf = '04086571463';
       message.email = 'ottc@teste.com';
       message.password = '123';

       console.log("Message:",message);
       _t.requestPOST(APIPATH+'/signup', message, function (err, res) {
               console.log("res.res.body:", res.res.body);
               assert.equal(res.res.body.status,"ok");
               done();
           });
   });
   it('API TEST: should not create user', function (done) {
       console.log("\n Should create user\n");

       message.cpf = '40929427882';
       message.email = 'ottc@teste.com';
       message.password = '123';

       console.log("Message:",message);
       _t.requestPOST(APIPATH+'/signup', message, function (err, res) {
           console.log("res.res.body:", res.res.body);
           assert.equal(res.res.body.status,"error");
           done();
       });
   });
   it('API TEST: should not create user', function (done) {
       console.log("\n Should create user\n");

       message.cpf = '04086571463';
       message.email = 'ottc@teste.com.br';
       message.password = '123';

       console.log("Message:",message);
       _t.requestPOST(APIPATH+'/signup', message, function (err, res) {
           console.log("res.res.body:", res.res.body);
           assert.equal(res.res.body.status,"error");
           done();
       });
   });

   it('API TEST: should  not allow login', function (done) {

       message.email =  'ottc@teste.com.br';
       _t.requestPOST(APIPATH+'/login', message,function (err,res) {
           assert(!err);
           console.log(res.body);
           assert.equal(res.statusCode, 401);
           //assert.equal(res.body.status, 'error');
           done();
       });

   });

   it('API TEST:should not allow login', function (done) {

       delete message.password;
       message.email =  'ottc@teste.com';
       _t.requestPOST(APIPATH+'/login', message,function (err,res) {
           assert.equal(res.statusCode, 400); //invalid params
//           assert.equal(res.body.status, 'error');
           done();
       });
   });

   it('should allow user login', function (done) {

       message.password = "123";
       message.email =  'ottc@teste.com';

       _t.requestPOST(APIPATH+'/login', message,function (err,res) {
           console.log("Params:",res.body);
           assert.equal(res.statusCode, 200);
           assert.equal(res.body.status, 'ok');
           done();
       });
   });

   it("DB:find user should return one the user", function (done) {
       UsersOpr.findUserByUserId(message.user_id, function (err, data) {
           assert.equal(data.length, 1);
           console.log("Found:", data[0]);
           //TODO:compare more
           assert.equal(data[0].data.cpf, message.cpf);
           done();
       });
   });



   it('API TEST: should create user', function (done) {
       console.log("\n Should create user\n");

       message.cpf = '40929427882';
       message.email = 'ottc@teste.com.br';
       message.password = '123';

       console.log("Message:",message);
       _t.requestPOST(APIPATH+'/signup', message, function (err, res) {
           console.log("res.res.body:", res.res.body);
           assert.equal(res.res.body.status,"ok");
           done();
       });
   });


   it('should not allow to updateUser',function(done){

       message.name = "OTTC+";
       message.device_id = '04086571463';

       _t.requestPOST(APIPATH+'/update', message,function (err,res) {
           console.log("Res body: ",res.body);
           assert.equal(res.body.status,'error');
           done();
       });

   });

   it('should allow to updateUser',function(done){

       message.name = "OTTC+";
       message.device_id = '40929427882';
       _t.requestPOST(APIPATH+'/update', message,function (err,res) {

           console.log("Res body:",res.body);
           assert.equal(res.body.status,'ok');
           done();
       });
   });

   it("DB:find user should return one the user", function (done) {
       UsersOpr.findUserByUserId(message.user_id, function (err, data) {
           assert.equal(data.length, 1);
           console.log("Found:", data[0]);
           //compare more
           assert.equal(data[0].data.cpf, message.cpf);
           done();
       });
   });

   it("DB:should delete user", function (done) {
       postOpt.deleteUser(message.user_id, function () {
           done();
       });
   });

   it("DB:should delete user", function (done) {
       message.device_id = '04086571463';
       postOpt.deleteUser(message.user_id, function () {
           done();
       });
   });

});