import Route from '@ember/routing/route';

export default class TrainingDetailsTargetProfilesRoute extends Route {
  async model() {
    return this.modelFor('authenticated.trainings.training');
  }
}
