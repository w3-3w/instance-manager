'use strict';

const config = require('../config')();

// This script is for building serverless.yml
// Serverless doesn't support variable parsing on keys.
// This script is a workaround.
// https://github.com/serverless/serverless/issues/2892
function _(identifier) {
  return () => {
    // path is relative to root
    const conditionKey = `${identifier}/${config.tag.key}`;
    const conditionBody = {};
    conditionBody[conditionKey] = false;
    return conditionBody;
  };
}

module.exports = {
  ec2: _('ec2:ResourceTag'),
  rds: _('rds:db-tag')
};
