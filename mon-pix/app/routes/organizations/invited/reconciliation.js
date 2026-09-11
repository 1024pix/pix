import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ReconciliationRoute extends Route {
  @service currentUser;
  @service accessStorage;
  @service store;
  @service session;
  @service router;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model() {
    return this.modelFor('organizations');
  }

  async afterModel({ verifiedCode, organizationToJoin }) {
    const organizationLearner = await this.store.queryRecord('organization-learner-identity', {
      userId: this.currentUser.user.id,
      organizationId: organizationToJoin.id,
    });

    if (organizationLearner) {
      this.accessStorage.setAssociationDone(organizationToJoin.id);
      if (verifiedCode.type === 'campaign') {
        this.router.replaceWith('campaigns.fill-in-participant-external-id', verifiedCode.id);
      } else {
        this.router.replaceWith('combined-courses.programme', verifiedCode.id);
      }
    }
  }
}
