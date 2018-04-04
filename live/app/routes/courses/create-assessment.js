import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  redirect(course) {
    const store = this.get('store');

    let assessment;

    return store.createRecord('assessment', { course, type: course.get('type') }).save()
      .then((createdAssessment) => assessment = createdAssessment)
      .then(() => store.queryRecord('challenge', { assessmentId: assessment.get('id') }))
      .then(challenge => this.replaceWith('assessments.challenge', { assessment, challenge }))
      .catch(() => {
        this.replaceWith('logout');
    });
  }
});
