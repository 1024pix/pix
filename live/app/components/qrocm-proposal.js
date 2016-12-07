import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['qrocm-proposal'],

  didInsertElement: function () {
    // XXX : jQuery handler here is far more powerful than declaring event in template helper.
    // It avoids to loose time with 'oh that handy jQuery event is missing',
    // or "How the hell did they construct input helper ?"
    this.$('input').keydown(() => {
      this.sendAction('onInputChanged');
    });
  }

});
