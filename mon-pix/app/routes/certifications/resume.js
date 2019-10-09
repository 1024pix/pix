import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    const certificationCourseId = params.certification_course_id;
    const store = this.store;
    return store.query('assessment', { filter: { type: 'CERTIFICATION', courseId: certificationCourseId, resumable: true } })
      .then((assessments) => {
        const assessment = assessments.get('firstObject');
        return this.replaceWith('assessments.resume', assessment.get('id'));
      });
  }

});
