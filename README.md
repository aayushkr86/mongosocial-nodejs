# README #

This README would normally document whatever steps are necessary to get your application up and running.

### What is this repository for? ###

### Installation ###

1) npm install
2) NODE_ENV=development node_modules/.bin/sequelize db:migrate
3) NODE_ENV=development node_modules/.bin/sequelize db:seed:all
* Quick summary
* Version
* [Learn Markdown](https://bitbucket.org/tutorials/markdowndemo)

### How do I get set up? ###

* Summary of set up
* Configuration
* Dependencies
* Database configuration
* How to run tests
* Deployment instructions

Migration on the AWS EC2 Instances
from the command line under the main folder type "eb". If the you have the Elastic Beanstalk CLI this will display the options available. Make sure that you select the correct environment. Then type the command "eb ssh". This will make the connection to the EC2 server. Once in, type "cd /var/app/current/" and that will put you into the correct spot to run migrations.

Login Credentials for testing:
development@u-rate.it
{@w5^^38ssHJhjBB

### Contribution guidelines ###

* Writing tests
* Code review
* Other guidelines

### Who do I talk to? ###

* Repo owner or admin
* Other community or team contact

## Recreate Database ##

1. export NODE_ENV=development
2. mysql -h 127.0.0.1 -u root -e "drop database urateit;create database urateit;"
3. node_modules/.bin/sequelize db:migrate
4. node_modules/.bin/sequelize db:seed:all

testing