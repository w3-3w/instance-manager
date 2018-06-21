'use strict';

const fs = require('fs');

// Serverless doesn't support variable parsing on keys.
// This script is a workaround.
// https://github.com/serverless/serverless/issues/2892
module.exports = () => {
  // path is relative to root
  const configPath = './config.json';
  const config = JSON.parse(fs.readFileSync(configPath));
  const conditionKey = `ec2:ResourceTag/${config.tag.key}`;
  const conditionBody = {};
  conditionBody[conditionKey] = false;
  return conditionBody;
};
