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

 File: user.js
 Authors:  Andre Yai
 Date: 2016-08-31
 */
var logger = require('log4js').getLogger('user');
var _ = require("underscore");
var async = require("async");
var requestUtils = require("../lib/request_utils");

var ValidateField = require("../lib/validateField");
var EmailTemplate = require('./emailTemplate');

var async = require('async');
var crypto = require('crypto');

var authController = require("./auth");
var UsersOprtDB = require('./../models/db/postgres/pg_users');

var UsersFunc = {};


//Create New User
UsersFunc.signupRequest = function(request, response) {

    var body = request.body;

    logger.debug("signupRequest ",body);

    checkNewUserRequest(body, function(err, msg) {
        if (err) {
            return requestUtils.sendResponseError(response, err);
        }

        UsersOprtDB.saveUser(msg, function(err, user){
            if (err) {
                logger.error("Erro ao gravar usuário, por favor entre em contato: ",err);
                return requestUtils.sendResponseError(response, "Erro ao gravar usuário, por favor entre em contato");
            }

            delete user.password;

            //TODO
            //if(msg.status == 'ok'){
            // Send email;
            //}

            request.user = user;

            return authController.doLoginRequest(request, response);
        });
    });

};


function checkNewUserRequest(body, callback) {

    var msg = body;

    if(Object.keys(msg).length == 0){
        return callback("Erro nenhum campo do usuário foi preenchido.",null);
    }

    var sanity = validateUserSignupFields(msg);
    if(sanity.length > 0) {
        return callback(("Erro nos parametros: "+sanity.join(",")),null);
    }

    UsersOprtDB.findUsersByEmailOrCPF(msg.email, msg.cpf, function (err, user) {

        if (err) {
            logger.error(err);
            return callback("Erro interno. Tente novamente ou entre em contato.",null);
        }

        if (user.length > 0) {
            return callback("Já existe usuário cadastrado com este email e/ou CPF.",null);
        }

        var message = {
            name       : msg.name,
            cpf        : msg.cpf,
            user_id    : msg.cpf, //user_id is the cpf
            gender     : msg.gender.toLowerCase(),
            email      : msg.email.toLowerCase(),
            password_new   : msg.password
        };

        return callback(null,message);
    });

};



function validateUserSignupFields(msg){

    var errors = [];

    if (!msg.email) {
        errors.push("Campo e-mail não foi passado");
    }

    if(msg.email && !ValidateField.validatorEmail.isEmail(msg.email)) {
        errors.push("Campo e-mail não contém um endereço válido");
    }

    if(!msg.cpf || !ValidateField.validateCPF(msg.cpf)) {
        errors.push("CPF não preenchido ou inválido");
    }

    // if(!msg.user_id) {
    //     errors.push("Campo user id não foi passado. Contato os administradores.");
    // }

    if (!msg.gender) {
        errors.push("Campo genêro nãoo foi preenchido.");
    }

    return errors;
};



UsersFunc.updateUser = function (request, response, next) {

    logger.debug("updateUser user: ",request.user, " body: ",request.body);

    if (!request.user) { //TESTANDO: nao precisaria desta verificacao... user sempre existe aqui
        logger.error("user not logged in.");
        return requestUtils.sendResponseError(response, "Erro interno. Usuário não logado");
    }

    var msg = request.body;

    var sessionUser = request.user.data;

    validateUserUpdateFields(sessionUser, msg, function(errors) {

        if(errors.length > 0) {
            logger.error("validateUserUpdateFields",errors);
            return requestUtils.sendResponseError(response,"Erro nos parametros: "+errors.join(","));
        }

        updateUserFields(sessionUser, msg);

        UsersOprtDB.updateUser(sessionUser, function(err, user) {
            if (err) {
                logger.error(err);
                return requestUtils.sendResponseError(response,"Erro interno. Tente novamente ou entre em contato.");
            }

            //TODO: Seria legal mandar um email falando dados atualizados com sucesso;

            return requestUtils.sendResponseOk(response,"Dados do usuário atualizados");
        });

    });
};


var ALLOWED_UPDATE_FIELDS = [
    "name",
    "gender",
    "email",
    "password_new"
];

function updateUserFields(user, msg) {
    _.each(ALLOWED_UPDATE_FIELDS, function(field) {
        if (msg[field]) {
            logger.debug("updateUserFields: ",field,msg[field]);
            user[field] = msg[field];
        }
    });

    //TODO: devo alterar o user_id também, para ficar igual ao CPF?... precisaria alterar outros tabelas da base. Ruim.

    if(msg.push_token) {
        if (!user.push_token || user.push_token.length == 0) {
            user.push_token = []
        }
        if (!_.contains(user.push_token, msg.push_token)) {
            user.push_token.push(msg.push_token);
        }
    }
}


function validateUserUpdateFields(sessionUser, msg, callback){
    var errors = [];

    if(msg.email && !ValidateField.validatorEmail.isEmail(msg.email)) {
        errors.push("Campo e-mail não contém um endereço válido");
    }

    if(msg.cpf) {
        errors.push("Campo CPF não pode ser alterado");
        return;
    }

    // Se nao alterou email ou cpf nao precisa validar na base
    if (msg.email) {
        UsersOprtDB.findUserByEmail(msg.email, function (err, user) {

            if (err) {
                logger.error("findUserByEmail", err);
                errors.push("Erro interno. Tente novamente ou entre em contato.");
                return callback(errors);
            }

            if (user && user.data.user_id !== sessionUser.user_id) {
                errors.push("Já existe usuário cadastrado com este email e/ou CPF.");
            }

            return callback(errors);
        });
    } else {
        return callback(errors);
    }

}
//----------

UsersFunc.requireResetPassword = function(req,response) {

    logger.info("requireResetPassword");
    var msg = req.body;

    async.waterfall([
        function(done) {
            crypto.randomBytes(20, function(err, buf) {
                var token = buf.toString('hex');
                if (err) {
                    logger.error('error randomByts ', err);
                    return done("Erro processando requisição. Tente novamente ou entre em contato");
                }
                done(null, token);
            });
        },
        function(token, done) {
            logger.info("Resetar a senha da conta:",msg['email']);
            UsersOprtDB.findUserByEmail(msg.email, function(err, user) {
                if (err || !user) {
                    logger.error('No account with that email address exists: ',msg.email);
                    return done("Não encontrou conta com esse email/cpf.");
                }

                user.data.resetPasswordToken = token;
                user.data.resetPasswordExpires = Date.now() + 24*3600*1000; // 24 hour
                UsersOprtDB.updateUser(user.data, function (err) {
                    if (err) {
                        logger.error('error  updateUser', err);
                        return done("Erro processando requisição. Tente novamente ou entre em contato");
                    }
                    done(null,token,user);
                });
            });
        },
        function(token, user, done){
            logger.info("Token: ",token,"user: ",user);
            EmailTemplate.resetPasswordEmail(req,token,user.data,function(err,msg){
                if (err) {
                    logger.error('error resetPasswordEmail', err);
                    return done("Erro enviando email para troca de senha. Tente novamente ou entre em contato");
                }
                done(null, msg);
            });
        }
    ], function(err) {
        if (err) {
            return requestUtils.sendResponseError(response,err);
        }

        logger.info("requireResetPassword sent: ",msg);
        requestUtils.sendResponseOk(response,"O email para alterar a senha foi enviado");
    });
};

UsersFunc.getResetPage = function(req,res) {

    logger.info("Entrou com o reset token: ",req.params.token);

    UsersOprtDB.findResetUser(req.params.token, function(err, user) {
        if (user == null) {
            logger.info('Password reset token is invalid or has expired.');
            res.render('alreadyreset');
        }
        else{
            logger.debug("Entrou na pagina para resetar a senha",user.email);
            res.render('reset', {
                user: req.user
            });
        }
    });
}

UsersFunc.changePassword = function (req,res,next) {

    logger.debug("changePassword");

    async.waterfall([
        function(done) {
            UsersOprtDB.findResetUser(req.params.token, function(err, user) {
                if (!user) {
                    return  res.status({status:'error',message:'Password reset token is invalid or has expired.'});
                }

                if(req.body.password == req.body.confirm){

                    user.password_new = req.body.password;
                    user.resetPasswordToken = undefined;
                    user.resetPasswordExpires = undefined;

                    UsersOprtDB.updateUser(user, function(err) {
                        done(err, user);
                    });
                }
                else {
                    res.render('reset', {
                        user: req.user,
                        messages: "Senhas são diferentes"});
                }
            });
        },
        function(user,done){
            EmailTemplate.conformationResetPasswordEmail(user,function(err,msg){
                done(err,msg);
            });
        }
    ], function(err) {
        res.render('confirmation');
    });
};


//Auxiliar Func;


module.exports = UsersFunc;
