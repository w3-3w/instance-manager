'use strict';

const fs = require('fs');

// Serverless doesn't support variable parsing on keys.
// This script is a workaround.
// https://github.com/serverless/serverless/issues/2892
module.exports = () => {
  const config = JSON.parse(fs.readFileSync('./config.json'));
  const conditionKey = `ec2:ResourceTag/${config.instance.tag.key}`;
  const conditionBody = {};
  conditionBody[conditionKey] = false;
  return conditionBody;
};
