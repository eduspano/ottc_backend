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

 File: user_api.js
 Authors: Julian Monteiro
 Date: 2017-01-28
 */
var express = require('express');

var userController = require('../controllers/user');
var authController = require('../controllers/auth');


var router = express.Router();
/**
 * @apiDefine UserGroup user APIs
 */

/**
 * @apiDefine LoginParam params login
 * @apiParam {String} email User email address (should be unique in the database)
 * @apiParam {String} password User password
 */

/**
 * @apiDefine UserParam params user
 * @apiParam {String} name User full name
 * @apiParam {String} cpf Valid CPF (should be unique in the database)
 * @apiParam {String} gender  masculino or feminino
 */

/**
 * @apiDefine ApiResponseEnvelope
 * @apiSuccess {String} status (ok|error)
 * @apiSuccess {String} message api result message
 *
 */

/**
 * @apiDefine ApiAuthRequiredError
 * @apiError AuthRequiredError Only authenticated users allowed
 *
 * @apiErrorExample Response (example):
 *     HTTP/1.1 401 Not Authenticated
 *     {
 *       "status" "error",
 *       "message": "Auth required"
 *     }
 */

/**
 * @apiDefine UserLoginResponse
 * @apiSuccess {Object} body content
 * @apiSuccess {Object} body.access_token auth token for subsequent requtes (Authorization: Bearer access_token)
 * @apiSuccess {Object} body.user user
 * @apiSuccess {String} body.user.user_id  id do usuario gerado pelo sistema (atualmente igual ao CPF)
 * @apiSuccess {String} body.user.name  nome do usuario
 * @apiSuccess {String} body.user.cpf  cpf
 * @apiSuccess {String} body.user.gender  gender
 * @apiSuccess {String} body.user.email  email
 */

/**
 * @api {post} /user/signup Create new user
 * @apiName CreateUser
 * @apiGroup UserGroup
 * @apiUse LoginParam
 * @apiUse UserParam
 *
 * @apiExample Example usage:
 * curl --data 'cpf=77777777777&email=teste777@teste.com&password=teste&name=NomeUsuario&gender=masculino'  http://localhost:4200/api/v1/user/signup
 *
 * @apiUse ApiResponseEnvelope
 * @apiUse UserLoginResponse
 *
 */
router.post('/signup',userController.signupRequest);


/**
 * @api {POST} /user/login Signin with an existing user.
 * @apiName LoginUser
 * @apiGroup UserGroup

 * @apiExample Example usage:
 * curl --data 'email=teste777@teste.com&password=teste'  http://localhost:4200/api/v1/user/login

 * @apiUse LoginParam

 * @apiUse ApiResponseEnvelope
 * @apiUse UserLoginResponse
 */
router.post('/login', authController.isAuthenticatedPassword, authController.doLoginRequest);


/**
 * @api {POST} /user/update Update user details
 * @apiName UpdateUser
 * @apiGroup UserGroup

 * @apiExample Example usage:
 * curl -H "Authorization: Bearer l5rZyErZqesiHTcQifpB2mI5txg=" --data 'email=teste888@teste.com&password_new=teste2&name=Lalala'  http://localhost:4200/api/v1/user/update

 * @apiParam {String} name Nome do usuario (opcional)
 * @apiParam {String} email Email (opcional)
 * @apiParam {String} gender (masculino|feminino) (opcional)
 * @apiParam {String} password_new Senha (opcional)
 * @apiParam {String} push_token Token para notificacao (opcional)
 *
 * @apiUse ApiResponseEnvelope
 * @apiUse UserLoginResponse
 *
 * @apiUse ApiAuthRequiredError
 */
router.post('/update', authController.isAuthenticatedBearer, userController.updateUser);


/**
 * @api {POST} /user/resetpassword Request reset password
 * @apiName ResetPasswordUser
 * @apiGroup UserGroup

 * @apiExample Example usage:
 * curl --data 'email=teste888@teste.com'  http://localhost:4200/api/v1/user/resetpassword

 * @apiParam {String} email Email
 *
 * @apiUse ApiResponseEnvelope
 */
router.post('/resetpassword',userController.requireResetPassword);


module.exports = router;