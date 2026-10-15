import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ConnectionMethodsRoute extends Route {
  @service store;

  async model() {
    const user = this.modelFor('authenticated.user-account');
    const authenticationMethods = await this.store.findAll('authentication-method', user.id);
    const accountInfo = await user.belongsTo('accountInfo').reload();
    return {
      user,
      authenticationMethods,
      accountInfo,
    };
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.isEmailEditionMode = false;
    controller.showEmailUpdatedMessage = false;
    controller.isPasswordEditionMode = false;
    controller.showPasswordUpdatedMessage = false;
  }
}
