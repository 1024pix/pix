import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedAttestationsRoute extends Route {
  @service currentUser;
  @service router;

  beforeModel() {
    if (!this.currentUser.canAccessAttestationsPage) {
      this.router.replaceWith('application');
    }
  }

  async model() {
    const divisions = await this.currentUser.organization.divisions;
    const options = divisions.map(({ name }) => ({ label: name, value: name }));
    return { options };
  }
}
