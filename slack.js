'use strict';

const {
  startInstances,
  stopInstances,
  displayInstances
} = require('./lib/instance');

/**
 * Process message params after "<trigger word> schedule".
 */
function processScheduleCommand(...params) {
  if (params.length < 1) {
    return 'TODO display both start and stop schedule status.';
  }
  switch (params[0]) {
    case 'start':
      return 'TODO';
    case 'stop':
      return 'TODO';
    case 'on':
    case 'enable':
      return 'TODO enable both start and stop schedule.';
    case 'off':
    case 'disable':
      return 'TODO disable both start and stop schedule.';
    case 'toggle':
      return 'TODO toggle both start and stop schedule.';
    case 'instances':
      return displayInstances(true, ...params.slice(1));
    default:
      return 'Invalid command.';
  }
}

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
  if (params.length < 1) {
    return 'Invalid command.';
  }
  switch (params[0]) {
    case 'startall':
      // start all available instances
      return startInstances(false);
    case 'start':
      if (params.length > 1) {
        return startInstances(false, ...params.slice(1));
      } else {
        return 'No instance specified.';
      }
    case 'stopall':
      // stop all available instances
      return stopInstances(false);
    case 'stop':
      if (params.length > 1) {
        return stopInstances(false, ...params.slice(1));
      } else {
        return 'No instance specified.';
      }
    case 'status':
    case 'list':
      // show instance status list
      return displayInstances(false, ...params.slice(1));
    case 'schedule':
      // schedule operations
      return processScheduleCommand(...params.slice(1));
    default:
      return 'Invalid command.';
  }
}

module.exports.handler = (event, context, callback) => {
  const querystring = require('querystring');
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
