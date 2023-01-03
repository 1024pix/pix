import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class OrganizationParticipantRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store
      .findRecord('organization-learner', params.participant_id)
      .catch(() => this.router.replaceWith('authenticated.organization-participants'));
  }
}
