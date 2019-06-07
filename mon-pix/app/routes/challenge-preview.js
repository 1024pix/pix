import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    const store = this.store;
    return store.findRecord('challenge', params.challenge_id);
  },

  afterModel(challenge) {
    const store = this.store;

    const assessment = store.createRecord('assessment', { type: 'PREVIEW' });

    const correctionAdapter = store.adapterFor('correction');

    correctionAdapter.refreshRecord('correction', { challengeId: challenge.get('id') });
    return assessment.save().then(() => {
      return this.replaceWith('assessments.challenge', assessment.id, challenge.id);
    });
  }
});
