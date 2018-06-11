'use strict';

const awsFactory = require('./awsFactory');
const event = awsFactory.event();

async function listRules() {
  const rawResult = await event.listRules({
    Limit: 100,
    NamePrefix: process.env.EVENT_RULE_PREFIX
  }).promise();
  return rawResult.Rules.map(rule => ({
    name: rule.Name.substring(process.env.EVENT_RULE_PREFIX.length),
    state: rule.State.toLowerCase(),
    schedule: rule.ScheduleExpression
  }));
}

module.exports = {
  async displayRule() {
    const rules = await listRules();
    return rules.map(rule => `${rule.name} ${rule.state} ${rule.schedule}`).join('\n');
  },

  async enableRule(...ruleNames) {
    const rules = await listRules();
    let rulesToBeEnabled = rules.filter(rule => rule.state === 'disabled');
    if (ruleNames.length > 0) {
      rulesToBeEnabled = rulesToBeEnabled.filter(rule => ruleNames.some(inp => inp === rule.name));
    }
    if (rulesToBeEnabled.length < 1) {
      return 'Oops. No valid schedules can be enabled.';
    }
    const promiseList = rulesToBeEnabled.map(rule => event.enableRule({
      Name: process.env.EVENT_RULE_PREFIX + rule.name
    }).promise());
    await Promise.all(promiseList);
    return 'Enabled schedules listed below.\n' +
        rulesToBeEnabled.map(rule => `${rule.name} ${rule.schedule}`);
  },

  async disableRule(...ruleNames) {
    const rules = await listRules();
    let rulesToBeDisabled = rules.filter(rule => rule.state === 'enabled');
    if (ruleNames.length > 0) {
      rulesToBeDisabled = rulesToBeDisabled.filter(rule => ruleNames.some(inp => inp === rule.name));
    }
    if (rulesToBeDisabled.length < 1) {
      return 'Oops. No valid schedules can be disabled.';
    }
    const promiseList = rulesToBeDisabled.map(rule => event.disableRule({
      Name: process.env.EVENT_RULE_PREFIX + rule.name
    }).promise());
    await Promise.all(promiseList);
    return 'Disabled schedules listed below.\n' +
        rulesToBeDisabled.map(rule => `${rule.name} ${rule.schedule}`);
  },

  async toggleRule(...ruleNames) {
    let rules = await listRules();
    if (ruleNames.length > 0) {
      rules = rules.filter(rule => ruleNames.some(inp => inp == rule.name));
    }
    if (rules.length < 1) {
      return 'Oops. No valid schedules can be toggled.';
    }
    const rulesToBeEnabled = rules.filter(rule => rule.state === 'disabled');
    const rulesToBeDisabled = rules.filter(rule => rule.state === 'enabled');
    const promiseListEnable = rulesToBeEnabled.map(rule => event.enableRule({
      Name: process.env.EVENT_RULE_PREFIX + rule.name
    }).promise());
    const promiseListDisable = rulesToBeDisabled.map(rule => event.disableRule({
      Name: process.env.EVENT_RULE_PREFIX + rule.name
    }).promise());

    await Promise.all([...promiseListEnable, ...promiseListDisable]);
    const textResult = [];
    if (rulesToBeEnabled.length > 0) {
      textResult.push('Enabled schedules listed below.\n' +
          rulesToBeEnabled.map(rule => `${rule.name} ${rule.schedule}`));
    }
    if (rulesToBeDisabled.length > 0) {
      textResult.push('Disabled schedules listed below.\n' +
          rulesToBeDisabled.map(rule => `${rule.name} ${rule.schedule}`));
    }
    return textResult.join('\n');
  }
};
