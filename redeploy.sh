#!/bin/bash

#
# Projeto OTTC - Operadora de Tecnologia de Transporte Compartilhado
# Copyright (C) <2017> Scipopulis Desenvolvimento e Análise de Dados Ltda
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <http://www.gnu.org/licenses/>.
#
# File: redeploy.sh
# Authors: julian monteiro
# Date: 2016-12-07
#
# Script para efetuar redeploy no projeto (git pull e reiniciar pm2)


NODE_ENV=$1
if [ -z "$NODE_ENV" ]; then
 echo "Usage: $0 (prod|dev)"
 exit 1;
fi

# parametros ambiente DEV
if [  "$NODE_ENV" = "dev" ]; then
  NODE_ENV='development';
  BRANCH=''
fi

# parametros ambiente PROD
if [  "$NODE_ENV" = "prod" ]; then
  NODE_ENV='production';
  BRANCH='master'
fi

echo "Redeploying ottc: $NODE_ENV (branch $BRANCH)";

pm2 flush && pm2 delete all

git checkout $BRANCH &&
git pull &&
npm install &&
echo "*** Iniciando ottc_config_queues" &&
NODE_ENV=$NODE_ENV node ./bin/config_queues &&
echo "*** Atualizand DB" &&
NODE_ENV=$NODE_ENV ./node_modules/knex/bin/cli.js  migrate:latest --knexfile knexfile.js &&
NODE_ENV=$NODE_ENV ./node_modules/knex/bin/cli.js  seed:run  --knexfile knexfile.js &&
echo "*** Iniciando ottc_consumer" &&
pm2 start --env $NODE_ENV pm2-ottc.config.js --only ottc_consumer &&
echo "*** Iniciando ottc_receiver" &&
pm2 start --env $NODE_ENV pm2-ottc.config.js --only ottc_receiver

echo "Processos reiniciados."
echo " - verificar status: pm2 list"
echo " - verificar logs: pm2 logs ID (ou NOME)"
echo " - reiniciar: pm2 restart ID (ou NOME)"

