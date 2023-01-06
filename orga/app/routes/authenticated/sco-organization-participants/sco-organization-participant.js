import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ScoOrganizationParticipantRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store
      .findRecord('organization-learner', params.eleve_id)
      .catch(() => this.router.replaceWith('authenticated.sco-organization-participants'));
  }
}
