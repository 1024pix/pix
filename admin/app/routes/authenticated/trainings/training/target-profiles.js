import Route from '@ember/routing/route';

export default class TrainingDetailsTargetProfilesRoute extends Route {
  async model() {
    const training = await this.modelFor('authenticated.trainings.training');
    training.targetProfileSummaries.reload();
    return training;
  }
}
