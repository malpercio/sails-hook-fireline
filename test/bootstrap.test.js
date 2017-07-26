const Promise = require('bluebird');
const retry = require('bluebird-retry');
const sails = require('sails');
const sailsrc = require('./sailsrc');

before((done) => {
  if(process.env.DBUSER){
    sailsrc.connections.fireline.user = process.env.DBUSER;
  }
  if(process.env.PSSWD){
    sailsrc.connections.fireline.password = process.env.PSSWD;
  }
  if(process.env.DB){
    sailsrc.connections.fireline.database = process.env.DB;
  }
  sails.lift(sailsrc, done);
});

after(sails.lower);
