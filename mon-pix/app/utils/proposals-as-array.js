import isString from 'lodash/isString';
import isEmpty from 'lodash/isEmpty';

import flow from 'lodash/fp/flow';
import split from 'lodash/fp/split';
import thru from 'lodash/fp/thru';
import drop from 'lodash/fp/drop';

const calculate = flow(
  thru((e) => '\n' + e),
  split(/\n\s*-\s*/),
  drop(1)
);

export default function proposalsAsArray(proposals) {
  // check pre-conditions
  const DEFAULT_RETURN_VALUE = [];

  if (!isString(proposals)) return DEFAULT_RETURN_VALUE;
  if (isEmpty(proposals)) return DEFAULT_RETURN_VALUE;

  return calculate(proposals);
}
