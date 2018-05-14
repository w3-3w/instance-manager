'use strict';

const fs = require('fs');

module.exports = () => {
  const config = JSON.parse(fs.readFileSync('./config.json'));
  const conditionKey = `ec2:ResourceTag/${config.instance.tag.key}`;
  const conditionBody = {};
  conditionBody[conditionKey] = false;
  return conditionBody;
};