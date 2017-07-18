import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['score-pastille'],
  pixScore: null,

  score: Ember.computed('pixScore', function() {
    const pixScore = this.get('pixScore');
    return Ember.isNone(pixScore) ? '--' : pixScore;
  })
});
