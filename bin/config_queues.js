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

 Authors: Andre Yai, Julian Monteiro
 Date: 2017-03-20
 */

var logger = require('log4js').getLogger('config_queues');

var queue = require("../lib/queue");

var shouldCleanQueues = process.argv[2] && process.argv[2] === "--clean";

removeQueues(function(err) {
    if (err) {
        logger.error("Error configuring queues (removing old ones): ", err);
        process.exit(127);
        return;
    }

    queue.configQueues(function(err) {
        if (err) {
            logger.error("Error configuring queues: ", err);
            process.exit(127);
            return;
        }
        logger.info("Queues configured ok.");
        process.exit(0);
        return;
    });

});




function removeQueues(callback) {

    if (!shouldCleanQueues) {
        logger.info("not removing old queues, if needed pass --clean option")
        return callback();
    }

    logger.info("WARN! removing old queues and exchanges");

    queue.removeQueues(callback);
};