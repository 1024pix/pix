import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  redirect(course) {
    let assessment;
    const store = this.get('store');
    const challengeAdapter = store.adapterFor('challenge');

    return store.createRecord('assessment', { course }).save()
      .then((createdAssessment) => assessment = createdAssessment)
      .then(() => challengeAdapter.queryNext(store, assessment.id))
      .then(challenge => this.transitionTo('assessments.challenge', { assessment, challenge }));
  }

});
