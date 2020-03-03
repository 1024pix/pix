import { action } from '@ember/object';
import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class TermOfServiceController extends Controller {

  @service currentUser;
  @service store;

  @action
  async submit() {
    const user = this.currentUser.user;
    await user.save({ adapterOptions: { acceptPixOrgaTermsOfService: true } });

    const userOrgaSettings = await user.userOrgaSettings;
    if (!userOrgaSettings) {
      const userMemberships = await this.currentUser.user.memberships;
      const membership = await userMemberships.firstObject;
      const organization = await membership.organization;
      await this.store.createRecord('user-orga-setting', { user, organization }).save();
      await this.currentUser.load();
    }

    this.transitionToRoute('application');
  }
}
