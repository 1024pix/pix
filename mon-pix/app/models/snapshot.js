import Model, { attr, belongsTo } from '@ember-data/model';
import { computed } from '@ember/object';

export default Model.extend({
  testsFinished: attr('string'),
  score: attr('number'),
  createdAt: attr('date'),
  organization: belongsTo('organization'),
  user: belongsTo('user'),
  studentCode: attr('string'),
  campaignCode: attr('string'),
  numberOfTestsFinished: computed('testsFinished', function() {
    return this.testsFinished || 0;
  })
});
