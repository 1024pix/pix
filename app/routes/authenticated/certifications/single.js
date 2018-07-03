import Route from '@ember/routing/route';

export default Route.extend({
  redirect: function () {
    if (this.controller && this.controller.get('certificationId')) {
      this.transitionTo('authenticated.certifications.single.info', this.controller.get('certificationId'));
    }
  },
  actions: {
    loading(transition) {
      let controller = this.controller;
      if (controller) {
        controller.set('loading', true);
        transition.promise.finally(function() {
          controller.set('loading', false);
        });
      }
      return true; // allows the loading template to be shown
    }
  }
});
