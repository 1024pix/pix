import _ from 'mon-pix/utils/lodash-custom';

function calculate(proposals) {
  return _.chain(proposals)
    .thru((e) => '\n' + e)
    .split(/\n\s*-\s*/)
    .removeFirstElement()
    .value();
}

export default function proposalsAsArray(proposals) {
  // check pre-conditions
  const DEFAULT_RETURN_VALUE = [];

  if (_(proposals).isNotString()) return DEFAULT_RETURN_VALUE;
  if (_(proposals).isEmpty()) return DEFAULT_RETURN_VALUE;

  return calculate(proposals);
}
