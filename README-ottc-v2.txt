#
# Instruções de instalação de OTTC (AWS CentOS)
#

EC2 - Medium (por enquanto...)

Imagem: CentOS Linux 7 x86_64 HVM EBS 

#
# GENERAL
#
sudo yum install epel-release
sudo yum update
sudo yum install vim
sudo yum install git

# 
# NGINX
#
sudo yum install nginx
sudo systemctl start nginx
sudo systemctl enable nginx

#
# NODE
#
sudo curl --silent --location https://rpm.nodesource.com/setup_6.x > setup-node.sh
sudo bash setup-node.sh
sudo yum install -y nodejs
sudo npm install pm2 -g

#
# ERLANG (para o Rabbit)
#
# https://github.com/rabbitmq/erlang-rpm
# http://www.rabbitmq.com/releases/erlang/

curl -O http://www.rabbitmq.com/releases/erlang/erlang-19.0.4-1.el7.centos.x86_64.rpm
sudo yum install erlang-19.0.4-1.el7.centos.x86_64.rpm

# RABBIT
#
# https://www.rabbitmq.com/install-rpm.html 
#
curl -O https://www.rabbitmq.com/releases/rabbitmq-server/v3.6.5/rabbitmq-server-3.6.5-1.noarch.rpm
sudo rpm --import https://www.rabbitmq.com/rabbitmq-release-signing-key.asc
sudo yum install rabbitmq-server-3.6.5-1.noarch.rpm

#
# RABBIT CONFIG USER
#
sudo rabbitmq-plugins enable rabbitmq_management
sudo /etc/init.d/rabbitmq-server restart
sudo rabbitmqctl add_user scipop scipop!42
sudo rabbitmqctl set_permissions -p / scipop ".*" ".*" ".*"
sudo rabbitmqctl set_user_tags scipop administrator



#
# SSH KEY (DEPLOY BITBUCKET)
#
mkdir ~/.ssh
ssh-keygen -t rsa -f ~/.ssh/ottc-deploy.pem -N ''

### Enviar chave publica para cadastrarmos no Bitbucket (deploy)
cat ~/.ssh/ottc-deploy.pem.pub

echo "Host github.com
 IdentityFile ~/.ssh/ottc-deploy.pem" >> ~/.ssh/config


#
# BAIXAR PROJETO (apos chave publica enviada)
#
mkdir ~/src
cd ~/src
git clone git@github.com:scipopulis/ottc_backend.git

sudo pm2 startup centos
pm2 set pm2-logrotate:max_size 100M
pm2 set pm2-logrotate:compress true 

## Copiar arquivo pm2-ottc.config.js na raiz do projeto (contém configurações de acesso ao BD, senhas, etc).


#http://blog.jamesball.co.uk/2015/08/using-nginxapache-as-reverse-proxy-for.html

#
# APP
#
cd ~/src/ottc_backend
npm install


#
# RUN!
#

pm2 start pm2-ottc.config.js --env production --only ottc_config_queues
pm2 list #verificar se status "online" em verde.

#depois executar o consumer e receiver
pm2 start pm2-ottc.config.js --env production --only ottc_consumer
pm2 start pm2-ottc.config.js --env production --only ottc_receiver


pm2 save # para religar no reboot


#
# CONFIG NGINGX
#

#### Copiar arquivo config: /etc/nginx/conf.d/ottc.conf

# remover configuracao “server { ... }” do /etc/nginx/nginx.conf
sudo systemctl start nginx.service

#SELinux - libera conexao de rede para nginx
/usr/sbin/setsebool httpd_can_network_connect true 


--- Criar instância Postgresql e configurar pm2-ottc.config.js com parâmetros corretos de acesso —
Postgresql version 9.6

 sudo yum install https://download.postgresql.org/pub/repos/yum/9.6/redhat/rhel-7-x86_64/pgdg-redhat96-9.6-3.noarch.rpm
 sudo yum install postgresql96-server
 sudo /usr/pgsql-9.6/bin/postgresql96-setup initdb
 sudo  systemctl enable postgresql-9.6.service


CREATE USER ottc WITH PASSWORD 'ottc';
CREATE DATABASE ottc;
GRANT ALL PRIVILEGES ON DATABASE ottc to ottc;

CREATE DATABASE ottctest;
GRANT ALL PRIVILEGES ON DATABASE ottc to ottctest;


ALTER ROLE ottc IN ottctest SET search_path = ottc_test,public;

http://enterprisecraftsmanship.com/2015/08/10/database-versioning-best-practices/

https://github.com/quinnkeast/node-express-postgres-api-boilerplate/tree/master/server/config/environment


curl --data 'id=11111111111&provider=uber&status=RB&agency=saopaulo_sp&service=rideshare&lat=-23.5652&lng=-46.69754&ts=2017-02-07T04:01:02Z&ride_id=s120' http://127.0.0.1:4200/position

curl --data 'device_id=11111111111&email=teste@scipopulis.com&name=Usuario-Teste&cpf=11111111111&gender=masculino&password=123456' http://127.0.0.1:4200/user/signup
drop table ottc.latest;
drop table ottc.consolidate_user_day;
drop table ottc.positions;
drop table ottc.rides;
drop table ottc.rideprovider;
drop table ottc.watch_latest;

update rideprovider set data=
'{"companies":[

{"url":"imagesProvider/icone_easytaxi.png","logoUrl":"http://ottc.scipopulis.com/imagesProvider/icone_easytaxi.png","name":"easytaxi"},

{"url":"imagesProvider/icone_uber.png","logoUrl":"http://ottc.scipopulis.com/imagesProvider/icone_easytaxi.png","name":"uber"},
{"url":"imagesProvider/icone_cabify.png","logoUrl":"http://ottc.scipopulis.com/imagesProvider/icone_easytaxi.png","name":"cabify"},
{"url":"imagesProvider/icone_99.png","logoUrl":"http://ottc.scipopulis.com/imagesProvider/icone_easytaxi.png","name":"99"}],
"timestamp":"2017-01-02T17:55:30.331Z"}';

update users set data='{"cpf": "26547559831", "name": "Roberto Speicys Cardoso", "email": "speicys@gmail.com", "gender": "Masculino", "password": "$2a$05$b9.EpZ9QhK/FrqxkDgUopeDmj2hjUGicsTXcU9Pm5.Mmn22976S3O", "device_id": "26547559831"}'
where email='speicys@gmail.com';



# Adicionar random secret no config file
echo "\nconfig.jwt_secret = '"`python -c "import uuid; print uuid.uuid4()"`"';\n" >> config.development.js

curl --data 'mobile_id=1234asdf&user_id=77777777777&provider=uber&status=R&agency=saopaulo_sp&service=rideshare&lat=-23.5662&lng=-46.69854&ts=2017-02-07T04:11:02Z&ride_id=s120' http://127.0.0.1:4200/position
curl --data 'mobile_id=1234asdf&user_id=77777777777&provider=uber&status=R&agency=saopaulo_sp&service=rideshare&lat=-23.5672&lng=-46.69754&ts=2017-02-07T04:12:02Z&ride_id=s120' http://127.0.0.1:4200/position
curl --data 'mobile_id=1234asdf&user_id=77777777777&provider=uber&status=RE&agency=saopaulo_sp&service=rideshare&lat=-23.5672&lng=-46.69754&ts=2017-02-07T04:12:02Z&ride_id=s120' http://127.0.0.1:4200/position
