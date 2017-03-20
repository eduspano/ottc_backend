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

 File: provider.js
 Authors:  Julian Monteiro
 Date: 2017-01-13
 */
var _ = require("underscore");
var async = require("async");

var url = require('url');
var fs = require('fs');


var config = require("../lib/config");

var ProvidersOpr = require('./../models/db/postgres/pg_provider');


function listProviders(req, res){
    ProvidersOpr.findProviderList( function (err,data) {
        if(err != null || !data) {
            console.log("findProviderList err ",err,data);
            return res.status(200).send({status:"error", msg:"Não foi possivel listar as empresas. "});
        }

        var output =  {
            companies: _.pluck(data,'data')
        };

        return res.status(200).send(output);

    });
}



/**
 * Adiciona provider da base de dados
 *
 * //TODO: alterar para receber upload de arquivo
 *
 * @param req
 * @param res
 * @returns {*}
 */
function addProvider(req, res) {

    if (!req.body) return res.status(200).send({status:"error", message:"Missing body"});

    console.log(JSON.stringify(req.body));
    var companyName = req.body["name"];
    var pic = "icone_"+companyName + '.png';

    var newdoc = {
        name: companyName,
        url: 'imagesProvider/'+pic,  //TODO: Lagacy code - url relativa
        logoUrl: 'http://'+config.server_host+'/provider/logo/'+pic  //Após jan/17 - url absoluta
    };

    fs.readFile('images/' + pic, function (err, content) {
        if (err) {
            return res.status(200).send({status:"err",msg:"Não foi possivel cadastrar a empresa."});
        }

        ProvidersOpr.findProviderWithName(companyName, function (err,data) {

            if (err) {
                return res.status(200).send({status:"error",msg:"Erro processando requisicao", debug:err});

            }

            if (data) {
                return res.status(200).send({status:"error",msg:"Já existe operadora cadastrada com o mesmo nome"});
            }

            ProvidersOpr.insertProviderList(newdoc, function(err,data){
                if(data != null){
                    return res.status(200).send({status:"ok",msg:" Operadora cadastrada"});
                }
                else{
                    return res.status(200).send({status:"err",msg:" Operadora nao foi possivel ser cadastrada"});
                }
            });
        });
    });
}

function getProviderImage(req, res) {
    //use the url to parse the requested url and get the image name

    var pic = req.params.image;

    console.log("req.url: ",req.url,"\n");
    console.log("Image:",pic);

    // read the image using fs and send the image content back in the response
    fs.readFile('images/' + pic, function (err, content) {
        if (err) {
            res.writeHead(200, {'Content-type':'text/html'});
            console.log(err);
            res.end("No such image");
        } else {
            //specify the content type in the response will be an image
            res.writeHead(200,{'Content-type':'image/jpg'});
            res.end(content);
        }
    });
}

module.exports = {
    addProvider: addProvider,
    listProviders: listProviders,
    getProviderImage: getProviderImage
};
