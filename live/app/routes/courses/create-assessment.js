import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    return {
      courseId: params.course_id
    };
  },

  afterModel(model) {

    const store = this.get('store');
    const challengeAdapter = store.adapterFor('challenge');

    let assessment;

    return store
      .findRecord('course', model.courseId)
      .then((course) => {
        return store.createRecord('assessment', { course }).save();
      })
      .then((createdAssessment) => {
        assessment = createdAssessment;
        return challengeAdapter.queryNext(store, assessment.get('id'));
      })
      .then(challenge => {
        if (challenge) {
          this.transitionTo('assessments.get-challenge', { assessment, challenge });
        } else {
          this.transitionTo('assessments.get-results', { assessment });
        }
      });
  }

});
