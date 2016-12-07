import Ember from 'ember';

export default Ember.Component.extend({

  classNames: ['qroc-proposal'],

  didInsertElement: function () {
    // XXX : jQuery handler here is far more powerful than declaring event in template helper.
    // It avoids to loose time with 'oh that handy jQuery event is missing',
    // or "How the hell did they construct input helper ?"
    this.$('input').keydown(() => {
      this.sendAction('onInputChanged');
    });

    //XXX : prevent from abandonned question to be displayed
    if (this.$('input').val() === '#ABAND#') {
      this.$('input').val('');
    }
  }
});
