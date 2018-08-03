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
  async ec2Start(event, context) {
    if (isExcludeDay()) {
      return {
        message: 'skipped',
        event
      };
    }
    // start all scheduled instances
    const message = await startEC2Instances(true);
    return { message, event };
  },

  async ec2Stop(event, context) {
    if (isExcludeDay()) {
      return {
        message: 'skipped',
        event
      };
    }
    // stop all scheduled instances
    const message = await stopEC2Instances(true);
    return { message, event };
  },

  async rdsStart(event, context) {
    if (isExcludeDay()) {
      return {
        message: 'skipped',
        event
      };
    }
    // start all scheduled instances
    const message = await startRDSInstances(true);
    return { message, event };
  },

  async rdsStop(event, context) {
    if (isExcludeDay()) {
      return {
        message: 'skipped',
        event
      };
    }
    // stop all scheduled instances
    const message = await stopRDSInstances(true);
    return { message, event };
  }
};
