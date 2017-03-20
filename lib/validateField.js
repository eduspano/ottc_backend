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

 Utils

 File: utils.js
 Authors: Andre Yai
 Date: 2016-12-21
 */


var ValidateField = {};

ValidateField.validatorEmail = require('validator');

ValidateField.validateCPF = function (strCPF){

    var Sum;
    var Rest;

    Sum = 0;

    if (strCPF == "00000000000") {
        return false;
    }

    for (var i=1; i<=9; i++) {
        Sum = Sum + parseInt(strCPF.substring(i - 1, i)) * (11 - i);
    }
    Rest = (Sum * 10) % 11;

    if ((Rest == 10) || (Rest == 11))  {
        Rest = 0;
    }
    if (Rest != parseInt(strCPF.substring(9, 10)) ) {
        return false;
    }

    Sum = 0;

    for (i = 1; i <= 10; i++) {
        Sum = Sum + parseInt(strCPF.substring(i-1, i)) * (12 - i);
    }

    Rest = (Sum * 10) % 11;

    if ((Rest == 10) || (Rest == 11)) {
        Rest = 0;
    }
    if (Rest != parseInt(strCPF.substring(10, 11))) {
        return false;
    }
    return true;
}



ValidateField.isFloat = function(n){
    return Number(n) === n && n % 1 !== 0;
}


ValidateField.isNormalInteger = function(str) {
    var n = Math.floor(Number(str));
    return String(n) === str && n >= 0;
}
module.exports = ValidateField;
