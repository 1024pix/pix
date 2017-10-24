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

    return store.findRecord('course', model.courseId)
      .then((course) => store.createRecord('assessment', { course }).save())
      .then((createdAssessment) => assessment = createdAssessment)
      .then(() => challengeAdapter.queryNext(store, assessment.get('id')))
      .then(challenge => this.transitionTo('assessments.get-challenge', { assessment, challenge }));
  }

});
