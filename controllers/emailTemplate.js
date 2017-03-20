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

 File: emailTemplate.js
 Authors:  Andre Yai
 Date: 2016-09-14
 */
var logger = require('log4js').getLogger('emailSender');

var nodemailer = require('nodemailer');

var config = require("../lib/config");

if (!config.smtp.url || config.smtp.url.indexOf("smtp://") !== 0 || config.smtp.url.length < 10) {
    logger.error("WARN: config.smtp.url not set correctly. Email desactivated");
}

var smtpTransport =  nodemailer.createTransport(config.smtp.url);

var EmailTemplate = { };

EmailTemplate.resetPasswordEmail = function(req, token, user, cbk) {


    var site =  config.receiver.host || req.headers.host;

    if (!site) {
        logger.error("error sendEmail - config.receiver.host not set");
        return cbk("Configuracao do envio de email incompleta. Por favor entre em contato");
    }

    if (!config.smtp.url) {
        return cbk("Configuracao do envio de email incompleta (smtp not set). Por favor entre em contato");
    }

    if (site.indexOf("http://") !== 0) {
        site = "http://"+site;
    }


    var url =  site + '/user/reset/' + token;

    var mailOptions = {
        from: 'smtp@scipopulis.com',
        to: user.email,
        subject: 'Alteração de senha ',
        text: "Olá "+(user.name||'')+",\n\n"
        + "Parece que você esqueceu a sua senha. Não tem problema, clique no link abaixo para criar uma senha nova:\n\n"
        + url + "\n\n"
        + "Bom trabalho,\n\n"
        + "Administrador"
    };
    smtpTransport.sendMail(mailOptions, function(err,response) {
        if(err){
            logger.error("error sendEmail:",err, " response: ",response);
        }
        cbk(err, 'done');
    });
}



EmailTemplate.conformationResetPasswordEmail  = function(user, cbk) {

    if (!config.smtp.url) {
        return cbk("Configuracao do envio de email incompleta (smtp not set). Por favor entre em contato");
    }


    var mailOptions = {
        from: 'smtp@scipopulis.com',
        to: user.email,
        subject: 'A senha do usuário do seu email foi alterada',
        text: 'Olá '+(user.name||'')+',\n\n' +
        'Este é o email de confirmação de que a conta do email ' + user.email + '  foi alterada.\n\n'+
        "Bom trabalho,\n\n"
        + "Administrador"
    };

    smtpTransport.sendMail(mailOptions, function(err, response){
        if(err){
            logger.error("error sendEmail:",err, " response: ",response);
            cbk(error,'error');
        }
        else{
            logger.debug("sendEmail response:",response);
            cbk(null,'ok');
        }
    });
};

module.exports = EmailTemplate;

