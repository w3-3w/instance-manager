'use strict';

const AWS = require('aws-sdk');
const config = require('../config/aws');
AWS.config.region = config.region;

module.exports = {
  ec2(apiVersion = config.apiVersion.ec2) {
    return new AWS.EC2({ apiVersion });
  },
  event(apiVersion = config.apiVersion.event) {
    return new AWS.CloudWatchEvents({ apiVersion });
  },
  rds(apiVersion = config.apiVersion.rds) {
    return new AWS.RDS({ apiVersion });
  }
};
