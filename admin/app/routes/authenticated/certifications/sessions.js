import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  notifications: service(),

  redirect: function(model, transition) {
    if (transition.intent.name === 'authenticated.certifications.sessions') {
      if (this.controller && this.controller.get('sessionId')) {
        this.transitionTo('authenticated.certifications.sessions.info', this.controller.get('sessionId'));
      }
    }
  },

  actions: {

    loading(transition) {
      const controller = this.controller;
      if (controller) {
        controller.set('loading', true);
        transition.promise.finally(function() {
          controller.set('loading', false);
        });
      }
      return true; // allows the loading template to be shown
    },

    error(error) {
      const controller = this.controller;
      if (controller) {
        controller.set('sessionId', null);
      }
      this.notifications.error(error);
      this.replaceWith('authenticated.certifications.sessions');
    }
  }
});
