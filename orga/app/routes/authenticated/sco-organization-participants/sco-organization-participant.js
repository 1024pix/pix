import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import RSVP from 'rsvp';

export default class ScoOrganizationParticipantRoute extends Route {
  @service store;
  @service router;
  @service currentUser;

  model(params) {
    return this.store
      .findRecord('organization-learner', params.eleve_id)
      .then((organizationLearner) => {
        return RSVP.hash({
          organizationLearner,
          organization: this.currentUser.organization,
        });
      })
      .catch(() => this.router.replaceWith('authenticated.sco-organization-participants'));
  }
}
