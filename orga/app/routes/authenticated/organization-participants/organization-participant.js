import Route from '@ember/routing/route';

export default class OrganizationParticipantRoute extends Route {
  model(params) {
    return { id: params.participant_id };
  }
}
