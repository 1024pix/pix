import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';

function parseProposals(proposals) {
  return `\n${proposals}`.split(/\n\s*-\s*/).slice(1);
}

export default function proposalsAsArray(proposals) {
  // check pre-conditions
  const DEFAULT_RETURN_VALUE = [];

  if (!isString(proposals)) return DEFAULT_RETURN_VALUE;
  if (isEmpty(proposals)) return DEFAULT_RETURN_VALUE;

  return parseProposals(proposals);
}
