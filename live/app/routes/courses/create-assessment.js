import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    const store = this.get('store');
    return store.findRecord('course', params.course_id);
  },

  afterModel(course) {
    const store = this.get('store');
    const challengeAdapter = store.adapterFor('challenge');
    const assessment = store.createRecord('assessment', { course });
    assessment.save().then(() => {
      challengeAdapter.queryNext(store, assessment.get('id')).then(challenge => {
        if (challenge) {
          this.transitionTo('assessments.get-challenge', { assessment, challenge });
        } else {
          this.transitionTo('assessments.get-results', { assessment });
        }
      });
    });
  }

});
