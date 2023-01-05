import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class SupOrganizationParticipantRoute extends Route {
  @service store;
  @service router;

  model(params) {
    return this.store
      .findRecord('organization-learner', params.etudiant_id)
      .catch(() => this.router.replaceWith('authenticated.sup-organization-participants'));
  }
}
