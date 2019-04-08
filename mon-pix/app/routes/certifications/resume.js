import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    const certificationCourseId = params.certification_course_id;

    return this.transitionTo('courses.create-assessment', certificationCourseId);
  }

});
