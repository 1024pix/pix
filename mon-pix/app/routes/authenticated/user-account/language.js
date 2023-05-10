import Route from '@ember/routing/route';

export default class UserAccountLanguageRoute extends Route {
  model() {
    return this.modelFor('authenticated.user-account');
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.showLanguageUpdatedMessage = false;
  }
}
