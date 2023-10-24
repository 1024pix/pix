import Route from '@ember/routing/route';

export default class MembersRoute extends Route {
  async model() {
    return {
      members: await this.modelFor('authenticated.team.list').members,
      hasCleaHabilitation: this.modelFor('authenticated.team.list').hasCleaHabilitation,
    };
  }
}
