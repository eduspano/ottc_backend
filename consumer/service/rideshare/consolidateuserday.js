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


 Authors:  Andre Yai
 Date: 2017-01-10
 */

var RideshareOpr = require("./../../../models/db/postgres/pg_rideshare");

var ConsolidateUserDay = {};

ConsolidateUserDay.buildConsolidate = function (obj,cpf,callback) {

    //TODO: day should be timestamp;
    console.log("OBJ:",obj);

    if(obj.data.ride_status == "CLOSED" || obj.data.ride_status == "CLOSED_TIMEOUT") {
        var begin_at = new Date(obj.begin_at);
        var dayStr =  begin_at.getFullYear() + ("0" + (begin_at.getMonth() + 1)).slice(-2) + ("0" + begin_at.getDate()).slice(-2);
        var date =  new Date(begin_at.getFullYear(), ("0" + (begin_at.getMonth() + 1)).slice(-2) , ("0" + begin_at.getDate()).slice(-2));

        RideshareOpr.findConsolidateUserDay(cpf, date,function (err,result) {
            console.log("ERR:",err,"RESULT:",result);
            if(err){
                return callback(err, null);
            }

            var rideConsolidateStatus = buildConsolidate(result[0],cpf,dayStr,date,obj);
            console.log("RIDECONSOLIDATE:",rideConsolidateStatus);

            if (result.length == 0) {
                return RideshareOpr.insertConsolidateUserDay(rideConsolidateStatus, callback);
            }
            else {
                return RideshareOpr.updateConsolidateUserDay(rideConsolidateStatus, callback);
            }
        });
    }
    else{
        return callback(null,null);
    }
};

var buildConsolidate = function(result,cpf,day,date,obj) {

    var rideConsolidateStatus = {};

    if (result) {
        console.log("result:",result);
        rideConsolidateStatus = {data:result.data, cpf:cpf, day:day, date:date, num_rides: result.num_rides + 1, total_km: result.total_km + (obj.distance_meters/1000)};
    }
    else {
        rideConsolidateStatus = {data:{mais1km: 0}, day:day, date: date, cpf:cpf,num_rides: 1, total_km: (obj.distance_meters/1000)};
    }

    if (obj.distance_meters > 1000) {
        rideConsolidateStatus.data["mais1km"] += 1;
    }

    if(!rideConsolidateStatus.data[obj.ride_status]){
        rideConsolidateStatus.data[obj.ride_status] = 1;
    }
    else{
        rideConsolidateStatus.data[obj.ride_status] += 1;
    }


    console.log("Status:",rideConsolidateStatus);

    return rideConsolidateStatus;
};


module.exports = ConsolidateUserDay;