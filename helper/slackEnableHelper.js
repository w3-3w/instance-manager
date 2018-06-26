'use strict';

const config = require('../config')();

// This script is for building serverless.yml
const functionConfig = {
  handler: 'slack.handler',
  description: 'Deal with slack messages'
};
if (config.slack.enabled) {
  functionConfig.events = [
    {
      http: {
        path: 'slack',
        method: 'post'
      }
    }
  ];
}

module.exports = () => functionConfig;
