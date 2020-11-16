import isNil from 'lodash/isNil';
import isEmpty from 'lodash/isEmpty';
import size from 'lodash/size';
import times from 'lodash/times';
import constant from 'lodash/constant';
import isArray from 'lodash/isArray';
import every from 'lodash/every';
import isBoolean from 'lodash/isBoolean';
import isString from 'lodash/isString';

import flow from 'lodash/fp/flow';
import concat from 'lodash/fp/concat';
import zip from 'lodash/fp/zip';

const concatToEnd = concat.convert({ rearg: true });

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
 *    [['is sky red ?', false],
 *     ['is sun red ?', true],
 *     ['is grass red ?', false],
 *     ['are clouds red ?' false]]
 */
export default function labeledCheckboxes(proposals, userAnswers) {

  // accept that user didn't give any answer yet
  const definedUserAnswers = isNil(userAnswers) ? [] : userAnswers;

  // check pre-conditions
  if (isNotArrayOfString(proposals)) return [];
  if (isEmpty(proposals)) return [];
  if (_isNotArrayOfBoolean(definedUserAnswers)) return [];
  if (size(definedUserAnswers) > size(proposals)) return [];

  const sizeDifference = size(proposals) - size(definedUserAnswers); // 2
  const arrayOfFalse = times(sizeDifference, constant(false)); // [false, false]

  const propsBuilder = flow( // [false, true]
    concatToEnd(arrayOfFalse), // [false, true, false, false]
    zip(proposals), // [['prop 1', false], ['prop 2', true], ['prop 3', false], ['prop 4', false]]
  );

  return propsBuilder(definedUserAnswers);
}

function _isNotArrayOfBoolean(collection) {
  return !isArray(collection) || !every(collection, isBoolean);
}

function isNotArrayOfString(collection) {
  return !isArray(collection) || !every(collection, isString);
}
