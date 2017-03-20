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
 Authors:  Julian Monteiro
 Date: 2016-06-18
 */

/*** EXPORTS ***/
module.exports.isUndefined = isUndefined;
module.exports.isFunction = isFunction;


/*** FUNCTIONS ***/

/**
 * convert underline, dash or space to CamelCase, with first letter uppercased
 *
 * @param object
 * @returns {boolean}
 */
module.exports.toPascalCase = function(string) {
    return string.replace(/(?:^|\s|_|-)(\w)/g, function (matches, letter) {
        return letter.toUpperCase();
    });
};


/**
 * Lower case first char
 * @param object
 * @returns {boolean}
 */
module.exports.lowerCaseFirst = function(string) {
    return string.charAt(0).toLowerCase() + string.substr(1);
};

/**
 * Upper case first char
 * @param object
 * @returns {boolean}
 */
module.exports.upperCaseFirst = function(string) {
    return string.charAt(0).toUpperCase() + string.substr(1);
};

/**
 * Return true if value is defined (to be used in object attributes)
 * @param object
 * @returns {boolean}
 */
function isUndefined(obj) {
    return typeof obj === 'undefined'
};

/**
 * Return true if value is a function
 * @param object
 * @returns {boolean}
 */
function isFunction(obj) {
    return typeof obj === 'function'
};