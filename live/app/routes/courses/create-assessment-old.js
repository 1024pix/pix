import Ember from 'ember';

/*
* keep old URL /courses/:course_id/assessment, with redirection
*/
export default Ember.Route.extend({

  model(params) {
    return params.course_id;
  },

  afterModel(courseId) {
    this.transitionTo('courses.create-assessment', courseId);
  }

});
