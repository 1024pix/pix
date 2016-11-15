import Ember from 'ember';

export default Ember.Component.extend({
  tagName: 'header',
  session: Ember.inject.service(),
  router: Ember.inject.service()
});
