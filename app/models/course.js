import Ember from 'ember';
import Model from 'ember-data/model';
import attr from 'ember-data/attr';

export default Model.extend({
  name: attr('string'),
  description: attr('string'),
  duration: attr('number'),
  imgUrl: attr('string'),
  courseDuration: Ember.computed('courseDuration', 'duration', function () {
    return Math.floor(this.get('duration')) % 80;
  })
});
