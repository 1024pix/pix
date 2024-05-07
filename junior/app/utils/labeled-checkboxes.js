import every from 'lodash/every';
import isArray from 'lodash/isArray';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import isString from 'lodash/isString';
import size from 'lodash/size';

/*
 * Example :
 * => Input :
 *     proposals :  ['is sky red ?' , 'is sun red ?' , 'is grass red ?' , 'is cloud red ?']
 * => Input :
 *     userAnswers :  [false, true]
 *
 * WARNING : only first(s) userAnswers are given,
 *           all others have implicitly the boolean value "false"
 *
 * => Output :
 *    [{ label: 'is sky red ?', checked: false, value: 1 },
 *     { label: 'is sun red ?', checked: true, value: 2 },
 *     { label: 'is grass red ?', checked: false, value: 3 },
 *     { label: 'are clouds red ?' checked: false, value: 4 }]
 */
export default function labeledCheckboxes(proposals, userAnswers) {
  // accept that user didn't give any answer yet
  const definedUserAnswers = isNil(userAnswers) ? [] : userAnswers;

  // check pre-conditions
  if (isNotArrayOfString(proposals)) return [];
  if (isEmpty(proposals)) return [];
  if (_isNotArrayOfBoolean(definedUserAnswers)) return [];
  if (size(definedUserAnswers) > size(proposals)) return [];

  return proposals.map((s, i) => ({
    label: s,
    value: i + 1,
    index: i,
    checked: definedUserAnswers[i] ?? false,
  }));
}

function _isNotArrayOfBoolean(collection) {
  return !isArray(collection) || !every(collection, isBoolean);
}

function isNotArrayOfString(collection) {
  return !isArray(collection) || !every(collection, isString);
}
