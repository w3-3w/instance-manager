'use strict';

const {
  startInstances,
  stopInstances
} = require('./lib/instance');

module.exports.start = (event, context, callback) => {
  // start all scheduled instances
  startInstances(true).then(message => {
    callback(null, { message, event });
  }, err => {
    callback(err);
  });
};

module.exports.stop = (event, context, callback) => {
  // stop all scheduled instances
  stopInstances(true).then(message => {
    callback(null, { message, event });
  }, err => {
    callback(err);
  });
};
