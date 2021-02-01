import Route from '@ember/routing/route';

export default class InvitationsRoute extends Route {

  model() {
    return this.modelFor('authenticated.team.list').organization.organizationInvitations;
  }
}
