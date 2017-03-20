#!/bin/bash

pm2 kill;

node bin/config_queues.js &&
knex migrate:latest --knexfile knexfile.js &&
pm2 start bin/iot_receiver.js &&
pm2 start bin/iot_consumer.js &&
pm2 logs