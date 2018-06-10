'use strict';

async function processCommand(commandTree, ...params) {
  if (params.length < 1) {
    return 'Command is required. Use "help" to see all available commands.';
  }
  if (commandTree.hasOwnProperty(params[0])) {
    const command = params[0];
    const args = params.slice(1);
    const operation = commandTree[command];
    switch (typeof operation) {
      case 'function':
        return operation(...args);
      case 'object':
        return processCommand(operation, ...args);
      default:
        return 'Illegal configuration. Contact system administrator.';
    }
  } else {
    return 'Invalid command. Use "help" to see all available commands.';
  }
}

module.exports = processCommand;
