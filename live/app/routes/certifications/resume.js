import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    const certificationCourseId = params.certification_course_id;

    return this.get('store').query('assessment', {
      filter: {
        courseId: certificationCourseId
      }
    }).then((assessments)=> {
      return assessments.get('firstObject');
    });
  },

  afterModel(assessment) {
    return this.get('store')
      .queryRecord('challenge', { assessmentId: assessment.get('id') })
      .then((nextChallenge) => this.transitionTo('assessments.challenge', assessment.get('id'), nextChallenge.get('id')))
      .catch(() => this.transitionTo('certifications.results', assessment.get('course.id')));
  },

  actions: {
    error() {
      this.transitionTo('index');
    }
  }
});
