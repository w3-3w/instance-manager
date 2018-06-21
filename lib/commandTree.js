'use strict';
const {
  startEC2Instances,
  stopEC2Instances,
  displayEC2Instances
} = require('./ec2Instance');
const {
  displayRule,
  enableRule,
  disableRule,
  toggleRule
} = require('./rule');

module.exports = {
  help() {
    return 'Available subcommands:\n' +
        'ec2: Amazon Elastic Compute Cloud\n' +
        'rds: Amazon Relational Database Service';
  },
  ec2: {
    help() {
      return 'Available subcommands:\n' +
          'status:   show instance status list\n' +
          'startall: start all available instances\n' +
          'start:    start specified instances\n' +
          'stopall:  stop all available instances\n' +
          'stop:     stop specified instances\n' +
          'schedule: schedule configuration';
    },
    async startall() {
      return startEC2Instances(false);
    },
    async start(...params) {
      // start command should contain at least 1 server name
      if (params.length > 0) {
        return startEC2Instances(false, ...params);
      } else {
        return 'No instance specified.';
      }
    },
    async stopall() {
      return stopEC2Instances(false);
    },
    async stop(...params) {
      // stop command should contain at least 1 server name
      if (params.length > 0) {
        return stopEC2Instances(false, ...params);
      } else {
        return 'No instance specified.';
      }
    },
    async status(...params) {
      return displayEC2Instances(false, ...params);
    },
    schedule: {
      help() {
        return 'Available subcommands:\n' +
            'status:    show schedule status\n' +
            'enable:    enable schedule\n' +
            'disable:   disable schedule\n' +
            'toggle:    toggle schedule\n' +
            'instances: show scheduled ec2 instance list';
      },
      async status() {
        return displayRule('ec2');
      },
      async enable(...params) {
        return enableRule('ec2', ...params);
      },
      async disable(...params) {
        return disableRule('ec2', ...params);
      },
      async toggle(...params) {
        return toggleRule('ec2', ...params);
      },
      async instances() {
        return `Scheduled instances:\n${await displayInstances(true)}`;
      }
    }
  }
};
