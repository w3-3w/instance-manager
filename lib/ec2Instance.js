'use strict';

const ec2 = require('./awsFactory').ec2();
const config = require('../config/instance');

const STATE_CD = {
  STOPPED: 80,
  RUNNING: 16
};

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
      Name: `tag:${config.targetTag.key}`,
      Values: [config.targetTag.scheduledValue]
    });
  } else {
    // filter by tag key only
    params.Filters.push({
      Name: 'tag-key',
      Values: [config.targetTag.key]
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

module.exports = {
  /**
   * Start instances with specified names.
   *
   * If no instance name is specified, start all.
   */
  async startEC2Instances(scheduledOnly, ...instanceNames) {
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
      return 'Oops. No valid instance can be started.';
    }
  },

  /**
   * Stop instances with specified names.
   *
   * If no instance name is specified, stop all.
   */
  async stopEC2Instances(scheduledOnly, ...instanceNames) {
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
      return 'Oops. No valid instance can be stopped.';
    }
  },

  /**
   * Get instances' status text for display.
   */
  async displayEC2Instances(scheduledOnly, ...instanceNames) {
    const instances = await getInstances(scheduledOnly, ...instanceNames);
    if (instances.size < 1) {
      return 'Oops. No valid instance found.';
    }
    const displayTexts = Array.from(instances.values())
        .map(value => `${value.name} ${value.state}`).sort();
    return displayTexts.join('\n');
  }
};
