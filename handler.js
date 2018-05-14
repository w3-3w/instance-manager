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

async function getInstances(scheduledOnly, ...instanceNames) {
  const params = {
    DryRun: false,
    Filters: []
  };
  if (scheduledOnly) {
    params.Filters.push({
      Name: `tag:${process.env['TARGET_INSTANCE_TAG_KEY']}`,
      Values: [process.env['TARGET_INSTANCE_TAG_VALUE']]
    });
  } else {
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
      instances.set(instance.InstanceId, {
        name: nameTag ? nameTag.Value : null,
        state: instance.State.Name,
        stateCd: instance.State.Code
      });
    });
  });
  return instances;
}

async function startInstances(scheduledOnly, ...instanceNames) {
  const instances = await getInstances(scheduledOnly, ...instanceNames);
  const instancesCanBeStarted = Array.from(instances.entries())
      .filter(entry => entry[1].stateCd === STATE_CD.STOPPED);
  if (instancesCanBeStarted.length > 0) {
    const params = {
      DryRun: false,
      InstanceIds: instancesCanBeStarted.map(entry => entry[0])
    };
    const rawResult = await ec2.startInstances(params).promise();
    const startingInstanceIds = rawResult.StartingInstances.map(i => i.InstanceId);
    const displayTexts = startingInstanceIds.map(id => instances.get(id).name).sort();
    return `Starting instances listed below.\n${displayTexts.join('\n')}`;
  } else {
    return 'Oops. No valid instances can be started.';
  }
}

async function stopInstances(scheduledOnly, ...instanceNames) {
  const instances = await getInstances(scheduledOnly, ...instanceNames);
  const instancesCanBeStopped = Array.from(instances.entries())
      .filter(entry => entry[1].stateCd === STATE_CD.RUNNING);
  if (instancesCanBeStopped.length > 0) {
    const params = {
      DryRun: false,
      InstanceIds: instancesCanBeStopped.map(entry => entry[0])
    };
    const rawResult = await ec2.stopInstances(params).promise();
    const stoppingInstanceIds = rawResult.StoppingInstances.map(i => i.InstanceId);
    const displayTexts = stoppingInstanceIds.map(id => instances.get(id).name).sort();
    return `Stopping instances listed below.\n${displayTexts.join('\n')}`;
  } else {
    return 'Oops. No valid instances can be stopped.';
  }
}

async function displayInstances(scheduledOnly, ...instanceNames) {
  const instances = await getInstances(scheduledOnly, ...instanceNames);
  if (instances.size < 1) {
    return 'No valid instances found.';
  }
  const displayTexts = Array.from(instances.values())
      .map(value => `${value.name} ${value.state}`).sort();
  return displayTexts.join('\n');
}

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

async function processSlackRequestBody(body) {
  const message = body['text'].substring(body['trigger_word'].length).trim();
  if (body['token'] !== process.env['SLACK_OUTGOING_TOKEN']) {
    return 'Invalid token.';
  }
  const params = message.split(' ').filter(str => str);
  if (params.length < 1) {
    return 'Invalid command.';
  }
  switch (params[0]) {
    case 'startall':
      return startInstances(false);
    case 'start':
      if (params.length > 1) {
        return startInstances(false, ...params.slice(1));
      } else {
        return 'No instance specified.';
      }
    case 'stopall':
      return stopInstances(false);
    case 'stop':
      if (params.length > 1) {
        return stopInstances(false, ...params.slice(1));
      } else {
        return 'No instance specified.';
      }
    case 'status':
    case 'list':
      return displayInstances(false, ...params.slice(1));
    case 'schedule':
      return processScheduleCommand(...params.slice(1));
    case 'whoami':
      return `
channel_id=${body['channel_id']}
user_id=${body['user_id']}
`;
    default:
      return 'Invalid command.';
  }
}

module.exports.scheduledStart = (event, context, callback) => {
  startInstances(true).then(message => {
    callback(null, { message, event });
  }, err => {
    callback(err);
  });
};

module.exports.scheduledStop = (event, context, callback) => {
  stopInstances(true).then(message => {
    callback(null, { message, event });
  }, err => {
    callback(err);
  });
};

module.exports.slackControl = (event, context, callback) => {
  const querystring = require('querystring');
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
