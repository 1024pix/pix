import Route from '@ember/routing/route';

export default class SupOrganizationParticipantRoute extends Route {
  model(params) {
    return { id: params.etudiant_id };
  }
}
