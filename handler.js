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

async function getInstances(...instanceNames) {
  const params = {
    DryRun: false,
    Filters: [
      {
        Name: `tag:${process.env['TARGET_INSTANCE_TAG_KEY']}`,
        Values: [process.env['TARGET_INSTANCE_TAG_VALUE']]
      }
    ]
  };
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

async function startInstances(...instanceNames) {
  const instances = await getInstances(...instanceNames);
  const instancesCanBeStarted = instances.entries().filter(entry => entry[1].stateCd === STATE_CD.STOPPED);
  if (instancesCanBeStarted.length > 0) {
    const params = {
      DryRun: false,
      InstancesIds: instancesCanBeStarted.map(entry => entry[0])
    };
    const rawResult = await ec2.startInstances(params).promise();
    const startingInstanceIds = rawResult.StartingInstances.map(i => i.InstanceId);
    const displayTexts = startingInstanceIds.map(id => instances.get(id).name).sort();
    return `Starting instances listed below.\n${displayTexts.join('\n')}`;
  } else {
    return 'Oops. No valid instances can be started.';
  }
}

async function stopInstances(...instanceNames) {
  const instances = await getInstances(...instanceNames);
  const instancesCanBeStopped = instances.entries().filter(entry => entry[1].stateCd === STATE_CD.RUNNING);
  if (instancesCanBeStopped.length > 0) {
    const params = {
      DryRun: false,
      InstancesIds: instancesCanBeStopped.map(entry => entry[0])
    };
    const rawResult = await ec2.stopInstances(params).promise();
    const stoppingInstanceIds = rawResult.StoppingInstances.map(i => i.InstanceId);
    const displayTexts = stoppingInstanceIds.map(id => instances.get(id).name).sort();
    return `Stopping instances listed below.\n${displayTexts.join('\n')}`;
  } else {
    return 'Oops. No valid instances can be stopped.';
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
    case 'start':
      return startInstances(...params.slice(1));
    case 'stop':
      return stopInstances(...params.slice(1));
    case 'status':
      const instances = await getInstances(...params.slice(1));
      if (instances.size < 1) {
        return 'No valid instances found.';
      }
      const displayTexts = instances.values().map(value => `${value.name} ${value.state}`).sort();
      return displayTexts.join('\n');
    case 'schedule':
      return 'TODO';
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
  startInstances().then(message => {
    callback(null, { message, event });
  }, err => {
    callback(err);
  });
};

module.exports.scheduledStop = (event, context, callback) => {
  stopInstances().then(message => {
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