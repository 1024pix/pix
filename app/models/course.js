import Model from 'ember-data/model';
import attr from 'ember-data/attr';
// import { belongsTo, hasMany } from 'ember-data/relationships';

export default Model.extend({
  name: attr('string'),
  description: attr('string'),
  duration: attr('number'),
  courseDuration: Ember.computed('courseDuration', 'duration', function() {
    return Math.floor(this.get('duration') / 800);
  })
});
