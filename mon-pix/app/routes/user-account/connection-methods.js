import Route from '@ember/routing/route';

export default class ConnectionMethodsRoute extends Route {

  model() {
    return this.modelFor('user-account');
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.isEmailEditionMode = false;
    controller.showEmailUpdatedMessage = false;
  }
}
