import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class TrainingDetailsTargetProfilesRoute extends Route {
  async model() {
    const training = this.modelFor('authenticated.trainings.training');
    await training.targetProfileSummaries.reload();
    const targetProfileSummaries = await training.targetProfileSummaries;
    return RSVP.hash({
      training,
      targetProfileSummaries,
    });
  }
}
