import DS from 'ember-data';

const { Model, attr, belongsTo } = DS;
const { computed } = Ember;

export default Model.extend({

  value: attr('string'),
  result: attr('string'),
  assessment: belongsTo('assessment'),
  challenge: belongsTo('challenge'),
  
  isResultOk: computed('result', function () {
    return this.get('result') === 'ok'
  }),
  isResultWithoutAnswer: computed('result', function () {
    return this.get('result') === 'aband'
  }),
  isResultNotOk: computed('result', function () {
    return this.get('result') === 'ko'
  })

});
