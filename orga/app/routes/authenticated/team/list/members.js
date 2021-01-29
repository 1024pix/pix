import Route from '@ember/routing/route';

export default class MembersRoute extends Route {

  model() {
    return this.modelFor('authenticated.team.list').memberships;
  }
}
