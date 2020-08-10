import _ from 'lodash';

function calculate(proposals) {
  return _.chain(proposals)
    .thru((e) => '\n' + e)
    .split(/\n\s*-\s*/)
    .drop(1)
    .value();
}

export default function proposalsAsArray(proposals) {
  // check pre-conditions
  const DEFAULT_RETURN_VALUE = [];

  if (!_.isString(proposals)) return DEFAULT_RETURN_VALUE;
  if (_(proposals).isEmpty()) return DEFAULT_RETURN_VALUE;

  return calculate(proposals);
}
