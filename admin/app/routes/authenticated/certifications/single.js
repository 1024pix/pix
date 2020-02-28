import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({
  notifications: service(),

  redirect: function(model, transition) {
    if (transition.intent.name === 'authenticated.certifications.single') {
      if (this.controller && this.controller.get('certificationId')) {
        this.transitionTo('authenticated.certifications.single.info', this.controller.get('certificationId'));
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
        controller.set('certificationId', null);
      }
      this.notifications.error(error);
      this.replaceWith('authenticated.certifications.single');
    }
  }
});
