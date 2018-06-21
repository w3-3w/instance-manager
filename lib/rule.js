'use strict';

const awsFactory = require('./awsFactory');
const event = awsFactory.event();

function getPrefix(targetService) {
  return `${process.env.EVENT_RULE_PREFIX}-${targetService}-`;
}

async function listRules(prefix) {
  const rawResult = await event.listRules({
    Limit: 100,
    NamePrefix: prefix
  }).promise();
  return rawResult.Rules.map(rule => ({
    // slice the rule name to cut out prefix
    name: rule.Name.substring(prefix.length),
    state: rule.State.toLowerCase(),
    schedule: rule.ScheduleExpression
  }));
}

module.exports = {
  async displayRule(targetService) {
    const prefix = getPrefix(targetService);
    const rules = await listRules(prefix);
    return rules.map(rule => `${targetService} ${rule.name} ${rule.state} ${rule.schedule}`).join('\n');
  },

  async enableRule(targetService, ...ruleNames) {
    const prefix = getPrefix(targetService);
    const rules = await listRules(prefix);
    let rulesToBeEnabled = rules.filter(rule => rule.state === 'disabled');
    if (ruleNames.length > 0) {
      rulesToBeEnabled = rulesToBeEnabled.filter(rule => ruleNames.some(inp => inp === rule.name));
    }
    if (rulesToBeEnabled.length < 1) {
      return 'Oops. No valid schedules can be enabled.';
    }
    const promiseList = rulesToBeEnabled.map(rule => event.enableRule({
      Name: prefix + rule.name
    }).promise());
    await Promise.all(promiseList);
    return 'Enabled schedules listed below.\n' +
        rulesToBeEnabled.map(rule => `${targetService} ${rule.name} ${rule.schedule}`).join('\n');
  },

  async disableRule(targetService, ...ruleNames) {
    const prefix = getPrefix(targetService);
    const rules = await listRules(prefix);
    let rulesToBeDisabled = rules.filter(rule => rule.state === 'enabled');
    if (ruleNames.length > 0) {
      rulesToBeDisabled = rulesToBeDisabled.filter(rule => ruleNames.some(inp => inp === rule.name));
    }
    if (rulesToBeDisabled.length < 1) {
      return 'Oops. No valid schedules can be disabled.';
    }
    const promiseList = rulesToBeDisabled.map(rule => event.disableRule({
      Name: prefix + rule.name
    }).promise());
    await Promise.all(promiseList);
    return 'Disabled schedules listed below.\n' +
        rulesToBeDisabled.map(rule => `${targetService} ${rule.name} ${rule.schedule}`).join('\n');
  },

  async toggleRule(targetService, ...ruleNames) {
    const prefix = getPrefix(targetService);
    let rules = await listRules(prefix);
    if (ruleNames.length > 0) {
      rules = rules.filter(rule => ruleNames.some(inp => inp == rule.name));
    }
    if (rules.length < 1) {
      return 'Oops. No valid schedules can be toggled.';
    }
    const rulesToBeEnabled = rules.filter(rule => rule.state === 'disabled');
    const rulesToBeDisabled = rules.filter(rule => rule.state === 'enabled');
    const promiseListEnable = rulesToBeEnabled.map(rule => event.enableRule({
      Name: prefix + rule.name
    }).promise());
    const promiseListDisable = rulesToBeDisabled.map(rule => event.disableRule({
      Name: prefix + rule.name
    }).promise());

    await Promise.all([...promiseListEnable, ...promiseListDisable]);
    const textResult = [];
    if (rulesToBeEnabled.length > 0) {
      textResult.push('Enabled schedules listed below.\n' +
          rulesToBeEnabled.map(rule => `${targetService} ${rule.name} ${rule.schedule}`).join('\n'));
    }
    if (rulesToBeDisabled.length > 0) {
      textResult.push('Disabled schedules listed below.\n' +
          rulesToBeDisabled.map(rule => `${targetService} ${rule.name} ${rule.schedule}`).join('\n'));
    }
    return textResult.join('\n');
  }
};
