'use strict';

function* range(begin, end) {
  let it = begin;
  while (it <= end) {
    yield it;
    it += 1;
  }
}

const excludeDaysStr = process.env['EVENT_EXCLUDED_DAYS'] || '';
const excludeDaysRawList = excludeDaysStr.split(',');
const excludeDaysSet = new Set();
for (const rawDay of excludeDaysRawList) {
  if (!rawDay) {
    continue;
  }
  if (rawDay.match(/-/)) {
    // may be a day range expression
    const splitted = rawDay.split('/');
    if (splitted.length !== 2) {
      // not valid date
      continue;
    }
    const month = splitted[0];
    const days = splitted[1].split('-');
    if (days.length !== 2) {
      // not valid day range
      continue;
    }
    const [dayBegin, dayEnd] = days.map(n => parseInt(n, 10));
    for (const day of range(dayBegin, dayEnd)) {
      excludeDaysSet.add(`${month}/${day}`);
    }
  } else {
    excludeDaysSet.add(rawDay);
  }
}

module.exports = {
  prefix: process.env['EVENT_RULE_PREFIX'] || 'savingway',
  excludeDays: excludeDaysSet,
  timezoneOffset: parseFloat(process.env['TIMEZONE_OFFSET'] || '0', 10)
};
