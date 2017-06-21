import Ember from 'ember';

export default Ember.Route.extend({
  splash: Ember.inject.service(),

  activate() {
    this.get('splash').hide();
  }
});
