import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class UserSettingsRoute extends Route.extend(SecuredRouteMixin) {
  @service currentUser;

  async model() {
    const userSettings = await this.store.findRecord('user-setting', this.currentUser.user.id);
    return {
      userSettings,
    };
  }
}
