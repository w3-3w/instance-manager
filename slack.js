'use strict';

const querystring = require('querystring');
const {
  startInstances,
  stopInstances,
  displayInstances
} = require('./lib/instance');
const {
  displayRule,
  enableRule,
  disableRule,
  toggleRule
} = require('./lib/rule');
const processCommand = require('./lib/commandProcessor');

const COMMAND_TREE = {
  help() {
    return `Available commands:
status:   show instance status list
startall: start all available instances
start:    start specified instances
stopall:  stop all available instances
stop:     stop specified instances
schedule: schedule configuration`;
  },
  async startall() {
    return startInstances(false);
  },
  async start(...params) {
    // start command should contain at least 1 server name
    if (params.length > 0) {
      return startInstances(false, ...params);
    } else {
      return 'No instance specified.';
    }
  },
  async stopall() {
    return stopInstances(false);
  },
  async stop(...params) {
    // stop command should contain at least 1 server name
    if (params.length > 0) {
      return stopInstances(false, ...params);
    } else {
      return 'No instance specified.';
    }
  },
  async status(...params) {
    return displayInstances(false, ...params);
  },
  schedule: {
    help() {
      return `Available commands:
status:    show schedule status
enable:    enable schedule
disable:   disable schedule
toggle:    toggle schedule
instances: show scheduled instance list`;
    },
    async status() {
      return displayRule();
    },
    async enable(...params) {
      return enableRule(...params);
    },
    async disable(...params) {
      return disableRule(...params);
    },
    async toggle(...params) {
      return toggleRule(...params);
    },
    async instances() {
      return `Scheduled instances:\n${await displayInstances(true)}`;
    }
  }
};

/**
 * Process slack request body.
 */
async function processSlackRequestBody(body) {
  // get message without trigger word
  const message = body['text'].substring(body['trigger_word'].length).trim();
  // token verification
  if (body['token'] !== process.env['SLACK_OUTGOING_TOKEN']) {
    return 'Invalid token.';
  }
  // channel verification
  if (process.env['SLACK_CHANNEL_ID'] !== body['channel_id']) {
    return 'Invalid channel.';
  }
  // user verification
  const permittedUserIdsStr = process.env['SLACK_PERMITTED_USER_IDS'];
  const permittedUserIds = new Set(permittedUserIdsStr ? permittedUserIdsStr.split(',') : undefined);
  if (!permittedUserIds.has(body['user_id'])) {
    return `User ${body['user_name']} is not permitted to perform this operation.`;
  }
  // split parameters by space
  const params = message.split(' ').filter(str => str);
  // process command
  return `<@${body['user_id']}>\n${await processCommand(COMMAND_TREE, ...params)}`;
}

module.exports.handler = (event, context, callback) => {
  // parse body string to javascript object
  const requestBody = querystring.parse(event.body);

  processSlackRequestBody(requestBody).then(responseText => {
    const response = {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: responseText
      })
    };
    callback(null, response);
  }, err => {
    callback(err);
  });

};
