'use strict';

const STATE_CD = {
  STOPPED: 80,
  RUNNING: 16
};

const AWS = require('aws-sdk');
AWS.config.region = process.env['DEFAULT_AWS_REGION'];

const ec2 = new AWS.EC2({
  apiVersion: '2016-11-15'
});

/**
 * Get a Map of instances whose key is instance id.
 * 
 * If no instance name is specified, find all.
 */
async function getInstances(scheduledOnly, ...instanceNames) {
  const params = {
    DryRun: false,
    Filters: []
  };
  if (scheduledOnly) {
    // filter by tag key-value pair
    params.Filters.push({
      Name: `tag:${process.env['TARGET_INSTANCE_TAG_KEY']}`,
      Values: [process.env['TARGET_INSTANCE_TAG_VALUE']]
    });
  } else {
    // filter by tag key only
    params.Filters.push({
      Name: 'tag-key',
      Values: [process.env['TARGET_INSTANCE_TAG_KEY']]
    });
  }
  if (instanceNames.length !== 0) {
    params.Filters.push({
      Name: 'tag:Name',
      Values: instanceNames
    });
  }
  const rawResult = await ec2.describeInstances(params).promise();
  const instances = new Map();
  rawResult.Reservations.forEach(reservation => {
    reservation.Instances.forEach(instance => {
      const nameTag = instance.Tags.find(t => t.Key === 'Name');
      // pick up id, name and state, and set to Map
      instances.set(instance.InstanceId, {
        name: nameTag ? nameTag.Value : null,
        state: instance.State.Name,
        stateCd: instance.State.Code
      });
    });
  });
  return instances;
}

/**
 * Start instances with specified names.
 * 
 * If no instance name is specified, start all.
 */
async function startInstances(scheduledOnly, ...instanceNames) {
  const instances = await getInstances(scheduledOnly, ...instanceNames);
  // get entry array of stopped instances
  const instancesCanBeStarted = Array.from(instances.entries())
      .filter(entry => entry[1].stateCd === STATE_CD.STOPPED);
  if (instancesCanBeStarted.length > 0) {
    const params = {
      DryRun: false,
      InstanceIds: instancesCanBeStarted.map(entry => entry[0])
    };
    const rawResult = await ec2.startInstances(params).promise();
    const startingInstanceIds = rawResult.StartingInstances.map(i => i.InstanceId);
    // sort by instance name by natural order
    const displayTexts = startingInstanceIds.map(id => instances.get(id).name).sort();
    return `Starting instances listed below.\n${displayTexts.join('\n')}`;
  } else {
    return 'Oops. No valid instances can be started.';
  }
}

/**
 * Stop instances with specified names.
 * 
 * If no instance name is specified, stop all.
 */
async function stopInstances(scheduledOnly, ...instanceNames) {
  const instances = await getInstances(scheduledOnly, ...instanceNames);
  // get entry array of running instances
  const instancesCanBeStopped = Array.from(instances.entries())
      .filter(entry => entry[1].stateCd === STATE_CD.RUNNING);
  if (instancesCanBeStopped.length > 0) {
    const params = {
      DryRun: false,
      InstanceIds: instancesCanBeStopped.map(entry => entry[0])
    };
    const rawResult = await ec2.stopInstances(params).promise();
    const stoppingInstanceIds = rawResult.StoppingInstances.map(i => i.InstanceId);
    // sort by instance name by natural order
    const displayTexts = stoppingInstanceIds.map(id => instances.get(id).name).sort();
    return `Stopping instances listed below.\n${displayTexts.join('\n')}`;
  } else {
    return 'Oops. No valid instances can be stopped.';
  }
}

/**
 * Get instances' status text for display.
 */
async function displayInstances(scheduledOnly, ...instanceNames) {
  const instances = await getInstances(scheduledOnly, ...instanceNames);
  if (instances.size < 1) {
    return 'No valid instances found.';
  }
  const displayTexts = Array.from(instances.values())
      .map(value => `${value.name} ${value.state}`).sort();
  return displayTexts.join('\n');
}

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
  const permittedUserIds = new Set(process.env['SLACK_PERMITTED_USER_IDS'].split(','));
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
    case 'whoami':
      // tool for checking ids
      return `channel_id=${body['channel_id']}\nuser_id=${body['user_id']}`;
    default:
      return 'Invalid command.';
  }
}

module.exports.scheduledStart = (event, context, callback) => {
  // start all scheduled instances
  startInstances(true).then(message => {
    callback(null, { message, event });
  }, err => {
    callback(err);
  });
};

module.exports.scheduledStop = (event, context, callback) => {
  // stop all scheduled instances
  stopInstances(true).then(message => {
    callback(null, { message, event });
  }, err => {
    callback(err);
  });
};

module.exports.slackControl = (event, context, callback) => {
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
