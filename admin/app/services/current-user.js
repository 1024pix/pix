import Service, { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class CurrentUserService extends Service {
  @service session;
  @service store;
  @tracked adminMember;

  async load() {
    if (this.session.isAuthenticated) {
      try {
        this.adminMember = await this.store.queryRecord('admin-member', { me: true });
      } catch (error) {
        this.adminMember = null;
        return this.session.invalidate();
      }
    }
  }
}
