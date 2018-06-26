'use strict';

module.exports = {
  region: process.env['DEFAULT_AWS_REGION'] || 'ap-northeast-1',
  apiVersion: {
    ec2: '2016-11-15',
    event: '2015-10-07',
    rds: '2014-10-31'
  }
};
