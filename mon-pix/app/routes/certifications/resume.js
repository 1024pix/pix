import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    const certificationCourseId = params.certification_course_id;

    return this.transitionTo('courses.create-assessment', certificationCourseId);
  }

});
