import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class MembersController extends Controller {

  @service currentUser;

  @action
  async removeMembership(membership) {
    membership.organization = this.currentUser.organization;
    await membership.save({ adapterOptions: { disable: true } });
    this.send('refreshModel');
  }
}
