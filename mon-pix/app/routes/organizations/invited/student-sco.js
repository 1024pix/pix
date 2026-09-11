import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';

export default class StudentScoRoute extends Route {
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
    let organizationLearner = await this.store.queryRecord('organization-learner-identity', {
      userId: this.currentUser.user.id,
      organizationId: organizationToJoin.id,
    });

    if (!organizationLearner) {
      try {
        organizationLearner = await this.store
          .createRecord('sco-organization-learner', {
            userId: this.currentUser.user.id,
            organizationId: organizationToJoin.id,
          })
          .save({ adapterOptions: { tryReconciliation: true } });
      } catch (error) {
        if (get(error, 'errors[0].status') !== '422') {
          throw error;
        }
      }
    }

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
