'use strict';

const querystring = require('querystring');
const processCommand = require('./lib/commandProcessor');
const COMMAND_TREE = require('./lib/commandTree');
const config = require('./config/slack');

/**
 * Process slack request body.
 */
async function processSlackRequestBody(body) {
  // get message without trigger word
  const message = body['text'];
  // token verification
  if (body['token'] !== config.verificationToken) {
    return 'Invalid token.';
  }
  // team verification
  if (config.teamId !== body['team_id']) {
    return 'Invalid team.';
  }
  // channel verification
  if (config.channelId !== body['channel_id']) {
    return 'Invalid channel.';
  }
  // user verification
  if (!config.permittedUserIds.has(body['user_id'])) {
    return `User ${body['user_name']} is not permitted to perform this operation.`;
  }
  // split parameters by space and remove blank params
  const params = message.split(' ').filter(str => str);
  // process command
  return `<@${body['user_id']}>\n${await processCommand(COMMAND_TREE, ...params)}`;
}

module.exports = {
  handler(event, context, callback) {
    // parse body string to javascript object
    const requestBody = querystring.parse(event.body);

    processSlackRequestBody(requestBody).then(responseText => {
      const response = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          'response_type': 'in_channel',
          'text': responseText
        })
      };
      callback(null, response);
    }, err => {
      callback(err);
    });
  }
};
