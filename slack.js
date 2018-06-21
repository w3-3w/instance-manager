'use strict';

const querystring = require('querystring');
const processCommand = require('./lib/commandProcessor');
const COMMAND_TREE = require('./lib/commandTree');

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
          text: responseText
        })
      };
      callback(null, response);
    }, err => {
      callback(err);
    });
  }
};
