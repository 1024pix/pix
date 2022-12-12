import Route from '@ember/routing/route';

export default class ScoOrganizationParticipantRoute extends Route {
  model(params) {
    return { id: params.eleve_id };
  }
}
