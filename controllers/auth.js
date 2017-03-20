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

 File: auth.js
 Authors:  Julian Monteiro
 Date: 2017-03-13
 */
var logger = require('log4js').getLogger('auth');
var passport = require('passport');
var requestUtils = require("../lib/request_utils");

var crypto = require('crypto');

var LocalStrategy = require('passport-local').Strategy;
var BearerStrategy = require('passport-http-bearer').Strategy;

var config = require("../lib/config");
var UsersOpr = require('../models/db/postgres/pg_users');
var AccessTokensOpr = require('../models/db/postgres/pg_access_token');

var bcrypt = require('bcrypt-nodejs');

// var paramsLocal = {
//     passReqToCallback: true,
//     session: false
// };

// ---- auth methods

passport.use(new LocalStrategy({ usernameField: 'email', passwordField: 'password'}, authUsernamePasswordStrategy));
passport.use(new BearerStrategy(authTokenStrategy));
// ----


function authUsernamePasswordStrategy(username, password, callback) {
    logger.debug("authLocal ", username, password);

    UsersOpr.findUserByEmail(username, function (err, user) {
        if (err) {
            return callback(null, false, {message: 'Erro interno, por favor tente novamente ou entre em contato'});
        }

        // No user found with that username
        if (!user) {
            return callback(null, false, {message: 'Usuário não encontrado'});
        }

        // Make sure the password is correct
        verifyUserPassword(password, user.data, function (err, isMatch) {
            if (err) {
                return callback(err);
            }

            // Password did not match
            if (!isMatch) {
                return callback(null, false, {message: 'Senha incorreta'});
            }

            // Success
            return callback(null, user.data);
        });
    });
};


// Compare Password for login.
var verifyUserPassword = function (passwordCandidate, user, callback) {

    bcrypt.compare(passwordCandidate, user.password, function (err, isMatch) {
        if (err) return callback(err);
        callback(null, isMatch);
    });

};


function authTokenStrategy(access_token, callback) {
    logger.debug("authBearer ", access_token);

    AccessTokensOpr.findByToken(access_token, function (err, token) {
        if (err) {
            return callback(err);
        }

        // No token found
        if (!token) {
            return callback(null, false, {message: 'token not found'});
        }

        UsersOpr.findUserByUserId(token.user_id, function (err, user) {
            if (err) {
                return callback(err);
            }

            // No user found
            if (!user) {
                return callback(null, false, {message: 'user not found'});
            }

            // Simple example with no scope
            callback(null, user, {scope: '*'});
        });
    });
}

function doLoginRequest(req, res) {
    logger.debug("doLoginRequest:", req.user);

    var user = req.user;

    createUserToken(user, function (err, token) {
        if (err) {
            requestUtils.sendResponseError(res, err);
            return;
        }

        delete user.password;

        var content = {
            access_token: token,
            user: user
        };

        requestUtils.sendResponseOk(res, content);
    });
};

function createUserToken(user, callback) {

    //var token = jwt.encode({u:user.user_id,at:new Date()}, jwt_secret, "HS256");
    // var token = crypto.createSign('RSA-SHA256').write(JSON.stringify({u:user.user_id,at:new Date()})).sign(jwt_secret,'base64');

    crypto.randomBytes(20, function(err, buf) {
        if (err) {
            logger.error("Error generating token", err);
            return callback("Error generating token");
        }
        var token = buf.toString('base64');

        // Save the access token and check for errors
        AccessTokensOpr.saveToken(user.user_id, token, function (err) {
            if (err) {
                logger.error("Error saving token", err);
                return callback("Error saving token");
            }

            callback(null, token);
        });

    });



};

module.exports.doLoginRequest = doLoginRequest;
module.exports.isAuthenticatedBearer = passport.authenticate('bearer',{
    passReqToCallback: false,
    session: false
});
module.exports.isAuthenticatedPassword = passport.authenticate('local',{
    passReqToCallback: false,
    session: false
});
