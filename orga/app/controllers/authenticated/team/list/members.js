import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class MembersController extends Controller {
  @service currentUser;
  @service store;

  @action
  async removeMembership(membership) {
    membership.organization = this.currentUser.organization;
    await membership.save({ adapterOptions: { disable: true } });
    this.send('refreshModel');
  }

  @action
  async leaveOrganization() {
    await this.store.adapterFor('membership').leaveOrganization(this.currentUser.organization.id);
  }
}
