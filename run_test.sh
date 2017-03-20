#!/usr/bin/env bash

export DATABASE_URL='postgres://localhost:5432/ottc';

pm2 kill;

node bin/config_queues.js &&
pm2 start bin/iot_receiver.js &&
pm2 start bin/iot_consumer.js &&

pm2 logs

