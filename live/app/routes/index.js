import Ember from 'ember';

export default Ember.Route.extend({

  actions: {

    navigateToHome: function () {
      this.transitionTo('home');
    }
  }

});
