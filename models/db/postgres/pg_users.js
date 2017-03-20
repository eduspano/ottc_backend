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

 File: pg_users.js
 Authors: Andre Yai
 Date: 2016-12-21
 */
/**
 *   Operations on users table. In this file we have functions that helps to login, signup,resetPassword
 */
var logger = require('log4js').getLogger('pg_users');

var EnvSetUP = require('./pg_setup');
var db =  EnvSetUP.db;
var bcrypt = require('bcrypt-nodejs');

var UserOperation = {};

//Find user by its cpf or/and email.
UserOperation.findUsersByEmailOrCPF = function(email, cpf, callback){

    if(email == null && cpf == null) {
        return callback("Invalid params, email or cpf not provided",null);
    }

    db.query("SELECT data FROM users WHERE email = $1 or cpf = $2; ", [email, String(cpf)])
        .then(function(result){
            callback(null,result);
        })
        .catch(function (err){
            logger.error("Error fetching user:",err);
            callback(err, null);
        })
};


//Find user by email
UserOperation.findUserByEmail = function(email, callback){

    if(!email) {
        return callback("Invalid params, email not provided",null);
    }

    db.query("SELECT user_id, data FROM users WHERE email = $1", [email])
        .then(function(result){
            if (!result || result.length == 0) {
                return callback(null, null);
            }
            var user = result[0];
            user.data.user_id = user.user_id; //FIXME: workaround, na migracao nao atualizou o user_id dentro do data
            callback(null, user);
        })
        .catch(function (err){
            logger.error("Error fetching user:",err);
            callback(err, null);
        })
};


//Find user by email
UserOperation.findUserByUserId = function(user_id, callback){

    if(!user_id) {
        return callback("Invalid params, user_id not provided", null);
    }

    db.query("SELECT data FROM users WHERE user_id = $1", [user_id])
        .then(function(result){
            if (!result || result.length == 0) {
                return callback(null, null);
            }
            var user = result[0];
            user.data.user_id = user.user_id; //FIXME: workaround, na migracao nao atualizou o user_id dentro do data
            callback(null, user);
        })
        .catch(function (err){
            console.error("Error fetching user:",err);
            callback(err, null);
        })
};

UserOperation.deleteUser = function (user_id,callback) {

    db.none("Delete FROM users WHERE user_id = $1; ", [String(user_id)])
        .then(function(){
            callback(null,null);
        })
        .catch(function (err){
            callback(err, null);
        })
};

//Helps to hashPassword.
UserOperation.hashPassword = function (user,callback) {

    if (!user.password_new) { //Password didn't change
        return callback(null,user);
    }

    var SALT_FACTOR = 5;

    bcrypt.genSalt(SALT_FACTOR, function (err, salt) {
        if (err) return cbk(err,null);

        bcrypt.hash(user.password_new, salt, null, function (err, hash) {

            if (err) return next(err);

            user.password = hash;
            delete user.password_new;

            callback(null,user);
        });
    });

}

//Saves a new User.
UserOperation.saveUser = function(user,callback){

    this.hashPassword(user, function(err,user){
        if(err) {
            next(err);
        }

        console.log("saveUser: ",user);
        db.none("INSERT INTO users (email, cpf, user_id, data) values ($1,$2,$3,$4)",[user.email, user.cpf, user.user_id, user])
            .then(function(){
                callback(null,user);
            })
            .catch(function (err){
                callback(err, null);
            })
    });
};



//Update user to be abel to reset.
UserOperation.updateUser = function (user,callback) {

    this.hashPassword(user, function (err, user) {

        db.none("UPDATE users SET data = $1, cpf = $2, email = $3 WHERE user_id = $4; ", [user, user.cpf, user.email, user.user_id])
            .then(function(){
                callback(null, user);
            })
            .catch(function (err){
                callback(err, null);
            })
    });
};

//Find User that asked to reset password.
UserOperation.findResetUser = function(token,callback){

    var user = null;

    db.query("SELECT data FROM users WHERE   data->>'resetPasswordToken' = $1; ",[token])
        .then(function(result){
            if(result.length == 0){
                callback("No user",null);
            }
            user = result[0].data;
            if (user.resetPasswordExpires < new Date()){
                user = null;
            }
            callback(null,user);
        })
        .catch(function (err){
            callback(err,null);
        })
}

module.exports = UserOperation;