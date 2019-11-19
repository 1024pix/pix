import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    const store = this.store;
    const certificationCourse = store.peekRecord('certification-course', params.certification_course_id);
    this.replaceWith('assessments.resume', certificationCourse.get('assessment'));
  }
});
