import Route from '@ember/routing/route';

export default class MissionIntroductionRoute extends Route {
  async model() {
    return this.modelFor('identified.missions.mission');
  }
}
