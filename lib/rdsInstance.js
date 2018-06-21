'use strict';

const awsFactory = require('./awsFactory');
const rds = awsFactory.rds();

const STATES = {
  RUNNING: 'available',
  STOPPED: 'stopped'
};

async function getInstances(scheduledOnly, ...instanceNames) {
  const rawResult = await rds.describeDBInstances().promise();
  const instanceList = rawResult.DBInstances.filter(instance => (
    // filter DB instances that can be stopped
    // see https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_StopInstance.html#USER_StopInstance.Limitations
    !instance.MultiAZ &&
    !instance.ReadReplicaSourceDBInstanceIdentifier &&
    instance.ReadReplicaDBInstanceIdentifiers.length <= 0 &&
    instance.ReadReplicaDBClusterIdentifiers.length <= 0 &&
    !instance.Engine.startsWith('sqlserver') &&
    // if instanceNames specified, add to filter
    (instanceNames.length <= 0 || instanceNames.some(name => instance.DBInstanceIdentifier === name))
  )).map(instance => ({
    name: instance.DBInstanceIdentifier,
    state: instance.DBInstanceStatus,
    arn: instance.DBInstanceArn
  }));

  // fetch tags of all instances and filter by tag key and value
  const promises = instanceList.map(instance => (
    rds.listTagsForResource({
      ResourceName: instance.arn
    }).promise().then(data => {
      // attach instance info to AWS response
      data.instanceInfo = instance;
      return data;
    })
  ));
  const tagsAll = await Promise.all(promises);

  const instances = new Map();
  for (const tagInfo of tagsAll) {
    // find out instances that savingway has permission to control
    if (tagInfo.TagList.some(tag => (
      tag.Key === process.env['TARGET_TAG_KEY'] &&
      (!scheduledOnly || tag.Value === process.env['TARGET_TAG_VALUE'])
    ))) {
      instances.set(tagInfo.instanceInfo.name, tagInfo.instanceInfo);
    }
  }

  return instances;
}

module.exports = {
  async startRDSInstances(scheduledOnly, ...instanceNames) {
    const instances = await getInstances(scheduledOnly, ...instanceNames);
    const instancesCanBeStarted = Array.from(instances.entries())
        .filter(entry => entry[1].state === STATES.STOPPED);
    if (instancesCanBeStarted.length > 0) {
      await instancesCanBeStarted.map(entry => rds.startDBInstance({
        DBInstanceIdentifier: entry[0]
      }).promise());
      const displayTexts = instancesCanBeStarted.map(entry => entry[0]);
      return `Starting instances listed below.\n${displayTexts.join('\n')}`;
    } else {
      return 'Oops. No valid instance can be started.';
    }
  },

  async stopRDSInstances(scheduledOnly, ...instanceNames) {
    const instances = await getInstances(scheduledOnly, ...instanceNames);
    const instancesCanBeStopped = Array.from(instances.entries())
        .filter(entry => entry[1].state === STATES.RUNNING);
    if (instancesCanBeStopped.length > 0) {
      await instancesCanBeStopped.map(entry => rds.stopDBInstance({
        DBInstanceIdentifier: entry[0]
      }).promise());
      const displayTexts = instancesCanBeStopped.map(entry => entry[0]);
      return `Stopping instances listed below.\n${displayTexts.join('\n')}`;
    } else {
      return 'Oops. No valid instance can be stopped.';
    }
  },

  async displayRDSInstances(scheduledOnly, ...instanceNames) {
    const instances = await getInstances(scheduledOnly, ...instanceNames);
    if (instances.size < 1) {
      return 'Oops. No valid instance found.';
    }
    const displayTexts = Array.from(instances.values())
        .map(value => `${value.name} ${value.state}`).sort();
    return displayTexts.join('\n');
  }
};
