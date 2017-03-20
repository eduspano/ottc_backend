/**
   * Arquivo de de configuração PM2 para execução dos serviços OTTC
   * - receiver: API de recebimento de dados dos dispositivos móveis
   * - consumer: processamentos dos dados recebidos na Fila
   * - config_queues: script para configurar filas do RabbitMQ
   *
   * Para executar:
   *
   *
     pm2 start pm2-ottc.config.js --env production --only ottc_consumer
     pm2 start pm2-ottc.config.js --env production --only ottc_receiver

   * Antes criar as filas: NODE_ENV production node ./bin/config_queues.js
   *
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
module.exports = {
  apps : [
    {
      name      : "ottc_consumer",
      script    : "bin/iot_consumer.js",
      env_production : {
        NODE_ENV: "production"
      }
    },
    {
      name      : "ottc_receiver",
      script    : "bin/iot_receiver.js",
      env_production : {
        NODE_ENV: "production"
      }
    }
  ]
};

