import Ember from 'ember';

export default Ember.Route.extend({

  model() {
    return this.get('store').findAll('course');
  },

  actions: {
    startCourse(course) {
      this.transitionTo('courses.create-assessment', course);
    }
  }

});
