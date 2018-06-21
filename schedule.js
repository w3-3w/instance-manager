'use strict';

const {
  startEC2Instances,
  stopEC2Instances
} = require('./lib/ec2Instance');
const {
  startRDSInstances,
  stopRDSInstances
} = require('./lib/rdsInstance');

module.exports = {
  ec2Start(event, context, callback) {
    // start all scheduled instances
    startEC2Instances(true).then(message => {
      callback(null, { message, event });
    }, err => {
      callback(err);
    });
  },

  ec2Stop(event, context, callback) {
    // stop all scheduled instances
    stopEC2Instances(true).then(message => {
      callback(null, { message, event });
    }, err => {
      callback(err);
    });
  },

  rdsStart(event, context, callback) {
    // start all scheduled instances
    startRDSInstances(true).then(message => {
      callback(null, { message, event });
    }, err => {
      callback(err);
    });
  },

  rdsStop(event, context, callback) {
    // stop all scheduled instances
    stopRDSInstances(true).then(message => {
      callback(null, { message, event });
    }, err => {
      callback(err);
    });
  }
};
