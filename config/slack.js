'use strict';

module.exports = {
  incomingUrl: process.env['SLACK_INCOMING_WEBHOOK'],
  outgoingToken: process.env['SLACK_OUTGOING_TOKEN'],
  channelId: process.env['SLACK_CHANNEL_ID'],
  permittedUserIds: (str => (
    new Set(str ? str.split(',') : undefined)
  ))(process.env['SLACK_PERMITTED_USER_IDS'])
};
