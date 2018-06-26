'use strict';

module.exports = {
  targetTag: {
    key: process.env['TARGET_TAG_KEY'] || 'savingway-managed',
    scheduledValue: process.env['TARGET_TAG_VALUE'] || 'scheduled'
  }
};
