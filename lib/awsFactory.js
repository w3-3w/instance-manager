'use strict';

const AWS = require('aws-sdk');
AWS.config.region = process.env['DEFAULT_AWS_REGION'];

module.export = {
  ec2(apiVersion = '2016-11-15') {
    return new AWS.EC2({ apiVersion });
  },
  event(apiVersion = '2015-10-07') {
    return new AWS.CloudWatchEvents({ apiVersion });
  }
};
