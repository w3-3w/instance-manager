'use strict';

async function processCommand(commandTree, ...params) {
  if (params.length < 1) {
    return 'Command is required. Use "help" to see all available commands.';
  }
  const command = params[0];
  if (commandTree.hasOwnProperty(command)) {
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
  } else if (command === 'help') {
    // help message auto generation
    const properties = Object.getOwnPropertyNames(commandTree);
    const subcommands = [];
    const operations = [];
    for (const prop of properties) {
      switch (typeof commandTree) {
        case 'function':
          operations.push(prop);
          break;
        case 'object':
          subcommands.push(prop);
          break;
        default:
      }
    }
    return `Subcommands:\n${subcommands.join('\n')}\n\nOperations:\n${operations.join('\n')}`;
  } else {
    return 'Invalid command. Use "help" to see all available commands.';
  }
}

module.exports = processCommand;
