/* eslint ember/no-classic-classes: 0 */

import Model, { belongsTo, attr } from '@ember-data/model';
import { equal, not } from '@ember/object/computed';
import { computed } from '@ember/object';
import Mixin from '@ember/object/mixin';
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
  assessment: belongsTo('assessment'),
  challenge: belongsTo('challenge'),
  correction: belongsTo('correction'),
  levelup: belongsTo('levelup'),

  isResultOk: equal('result', 'ok'),
  isResultNotOk: not('isResultOk'),
});
