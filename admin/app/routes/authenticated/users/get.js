import Route from '@ember/routing/route';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class AuthenticatedUsersGetRoute extends Route {
  @service store;

  async model(params) {
    const user = await this.store.findRecord('user', params.user_id, {
      include: 'schoolingRegistrations,authenticationMethods',
    });
    await user.belongsTo('profile').reload();
    return user;
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
