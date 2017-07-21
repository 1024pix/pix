import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model() {
    return this.get('store').findAll('courseGroup');
  },

  actions: {
    startCourse(course) {
      this.transitionTo('courses.create-assessment', course.get('id'));
    }
  }

});
