import BaseRoute from 'pix-live/routes/base-route';

/*
* keep old URL /courses/:course_id/assessment, with redirection
*/
export default BaseRoute.extend({

  model(params) {
    return params.course_id;
  },

  afterModel(courseId) {
    this.transitionTo('courses.create-assessment', courseId);
  }

});
