import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AuthenticatedRoute extends Route {
  @service currentUser;
  @service router;
  @service session;
  @service store;
  @service joinInvitation;

  async beforeModel(transition) {
    this.session.requireAuthentication(transition, 'authentication.login');

    if (this.joinInvitation.invitation) {
      const userId = this.session.data.authenticated.user_id;
      await this.joinInvitation.acceptInvitationByUserId(userId);
    }

    await this.currentUser.load();

    if (transition.isAborted) {
      return;
    }

    const pixOrgaTermsOfServiceStatus = this.currentUser?.prescriber?.pixOrgaTermsOfServiceStatus;
    if (pixOrgaTermsOfServiceStatus !== 'accepted') {
      return this.router.replaceWith('terms-of-service');
    }
  }
}
