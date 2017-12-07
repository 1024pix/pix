import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    const certificationCourseId = params.certification_course_id;
    return this.get('store').findRecord('certification-course', certificationCourseId);
  },

  afterModel(certification) {
    const assessment = certification.get('assessment');
    return this.get('store')
      .queryRecord('challenge', { assessmentId: assessment.get('id') })
      .then((nextChallenge) => this.transitionTo('assessments.challenge', assessment.get('id'), nextChallenge.get('id')))
      .catch(() => this.transitionTo('certifications.results', certification.get('id')));
  },

  actions: {
    error() {
      this.transitionTo('index');
    }
  }
});
