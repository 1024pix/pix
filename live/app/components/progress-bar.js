import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['progress', 'pix-progress-bar'],

  barStyle: Ember.computed('progress.stepPercentage', function() {
    return Ember.String.htmlSafe(`width: ${this.get('progress.stepPercentage')}%`);
  })
});
