import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ChallengePreviewRoute extends Route {
  @service router;
  @service store;

  model(params) {
    this.challengeId = params.challenge_id;
  }

  afterModel() {
    const store = this.store;
    const assessment = store.createRecord('assessment', { type: 'PREVIEW' });

    return assessment.save().then(() => {
      return this.router.replaceWith('assessments.challenge', assessment.id, assessment.currentChallengeNumber, {
        queryParams: { challengeId: this.challengeId },
      });
    });
  }
}
