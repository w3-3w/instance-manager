'use strict';

const {
  startEC2Instances,
  stopEC2Instances
} = require('./lib/ec2Instance');
const {
  startRDSInstances,
  stopRDSInstances
} = require('./lib/rdsInstance');
const {
  excludeDays,
  timezoneOffset
} = require('./config/rule');

function isExcludeDay() {
  const now = new Date(Date.now() + timezoneOffset * 3600000);
  const month = now.getMonth() + 1;
  const day = now.getDate();
  return excludeDays.has(`${month}/${day}`);
}

module.exports = {
  ec2Start(event, context, callback) {
    if (isExcludeDay()) {
      return callback(null, {
        message: 'skipped',
        event
      });
    }
    // start all scheduled instances
    startEC2Instances(true).then(message => {
      callback(null, { message, event });
    }, err => {
      callback(err);
    });
  },

  ec2Stop(event, context, callback) {
    if (isExcludeDay()) {
      return callback(null, {
        message: 'skipped',
        event
      });
    }
    // stop all scheduled instances
    stopEC2Instances(true).then(message => {
      callback(null, { message, event });
    }, err => {
      callback(err);
    });
  },

  rdsStart(event, context, callback) {
    if (isExcludeDay()) {
      return callback(null, {
        message: 'skipped',
        event
      });
    }
    // start all scheduled instances
    startRDSInstances(true).then(message => {
      callback(null, { message, event });
    }, err => {
      callback(err);
    });
  },

  rdsStop(event, context, callback) {
    if (isExcludeDay()) {
      return callback(null, {
        message: 'skipped',
        event
      });
    }
    // stop all scheduled instances
    stopRDSInstances(true).then(message => {
      callback(null, { message, event });
    }, err => {
      callback(err);
    });
  }
};
