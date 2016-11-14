import Ember from 'ember';

export default Ember.Component.extend({

  didRender() {
    this._super(...arguments);
    $(function () {
      $('[data-toggle="tooltip"]').tooltip();
    });
  }
});
