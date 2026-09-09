import Route from '@ember/routing/route';

export default class TrainingDetailsTargetProfilesRoute extends Route {
  async model() {
    const training = this.modelFor('authenticated.trainings.training');
    await training.targetProfileSummaries.reload();
    const targetProfileSummaries = await training.targetProfileSummaries;
    return {
      training,
      targetProfileSummaries,
    };
  }
}
