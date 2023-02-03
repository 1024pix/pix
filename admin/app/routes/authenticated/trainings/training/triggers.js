import Route from '@ember/routing/route';

export default class TrainingDetailsTriggersRoute extends Route {
  async model() {
    return this.modelFor('authenticated.trainings.training');
  }
}
