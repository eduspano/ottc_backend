"use strict";
/*
 * Main config file.
 *
 * Override development and production in apropriate files.
 *
 * (import ./lib/config.js inside your files)
 *
 */

var config = {
    "debug": false,

    "receiver":  {
        "port": process.env.PORT || 4200,
        "host": process.env.SERVER_HOST || "127.0.0.1"
    },

    "db": {
        "url": process.env.DATABASE_URL || "postgres://ottc:ottc@127.0.0.1:5432/ottc",
        //"schema": process.env.DATABASE_SCHEMA|| "ottc"
    },

    "smtp" : {
        "url": null,  //ex. "smtp://user@pass:zoho.com"
    },

    "services": [ 'rideshare' ],

    "agencies": [
        {
            "agency_id": "saopaulo_sp",
            "service" : "rideshare",
            "agency_name": "Sao Paulo OTTC",
            "agency_timezone": "America/Sao_Paulo",
            "agency_lang": "pt_BR",
            "provider": "OTTC",
            "active": true,
            "center_coords" : {
                "lat": -23.478172,
                "lng": -46.621173
            }
        }
    ],

    "proccessQueue": "live_queue",

    "queueService": 'rabbitmq',

    //RABBIT
    "rabbitmq": {
        "url": process.env.AMQP_URL || "amqp://guest:guest@localhost",

        "services": ["rideshare"],

        "liveQueue": {
            "exchange": "iot.live",
            "namePrefix": "live_queue",
            "options": {
                "durable": true, // warranties queue is durable after restarts
                "noAck": false, // requires ack after retrieving messages from a queue; otherwise message will continue there
                "deadLetterExchange": "iot.deadletter",
                "messageTtl": 60 * 60 * 1000 //60 minutes
            },
            "messageOptions": {
                "deliveryMode": 2 // warranties message persistent
            }
        },

        "deadQueue": {
            "exchange": "iot.deadletter",
            'namePrefix': "dead_queue",
            "options": {
                "durable": true, // warranties queue is durable after restarts
            }
        },

        "storeQueue": {
            "exchange": "iot.live",
            'name': "store_queue",
            "options": {
                "durable": true // warranties queue is durable after restarts
            }
        }

    }
};

module.exports = config;