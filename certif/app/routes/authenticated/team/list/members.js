import Route from '@ember/routing/route';

export default class MembersRoute extends Route {
  model() {
    return {
      members: this.modelFor('authenticated.team').members,
      hasCleaHabilitation: this.modelFor('authenticated.team').hasCleaHabilitation,
    };
  }
}
