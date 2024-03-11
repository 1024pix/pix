/* eslint ember/no-classic-classes: 0 */

import { computed } from '@ember/object';
import { equal, not } from '@ember/object/computed';
import Mixin from '@ember/object/mixin';
import Model, { attr, belongsTo } from '@ember-data/model';
import jsyaml from 'js-yaml';

const ValueAsArrayOfString = Mixin.create({
  _valuesAsMap: computed('value', function () {
    try {
      return jsyaml.load(this.value);
    } catch (e) {
      return undefined;
    }
  }),
});

export default Model.extend(ValueAsArrayOfString, {
  value: attr('string'),
  result: attr('string'),
  resultDetails: attr('string'),
  timeout: attr('number'),
  focusedOut: attr('boolean'),
  assessment: belongsTo('assessment', { async: true, inverse: 'answers' }),
  challenge: belongsTo('challenge', { async: true, inverse: 'answer' }),
  correction: belongsTo('correction', { async: true, inverse: null }),
  levelup: belongsTo('levelup', { async: false, inverse: null }),

  isResultOk: equal('result', 'ok'),
  isResultNotOk: not('isResultOk'),
});
