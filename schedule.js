'use strict';

const {
  startEC2Instances,
  stopEC2Instances
} = require('./lib/ec2Instance');

module.exports.ec2Start = (event, context, callback) => {
  // start all scheduled instances
  startInstances(true).then(message => {
    callback(null, { message, event });
  }, err => {
    callback(err);
  });
};

module.exports.ec2Stop = (event, context, callback) => {
  // stop all scheduled instances
  stopInstances(true).then(message => {
    callback(null, { message, event });
  }, err => {
    callback(err);
  });
};
