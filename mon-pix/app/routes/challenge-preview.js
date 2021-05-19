import Route from '@ember/routing/route';

export default class ChallengePreviewRoute extends Route {
  model(params) {
    this.challengeId = params.challenge_id;
  }

  afterModel() {
    const store = this.store;
    const assessment = store.createRecord('assessment', { type: 'PREVIEW' });

    return assessment.save().then(() => {
      return this.replaceWith('assessments.challenge', assessment.id, { queryParams: { challengeId: this.challengeId } });
    });
  }
}
