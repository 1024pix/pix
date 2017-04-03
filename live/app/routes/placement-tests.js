import Ember from 'ember';

export default Ember.Route.extend({

  delay: Ember.inject.service(),

  model() {
    return this.store.query('course', { isAdaptive: true });
  },

  actions: {
    startCourse(course) {
      this.transitionTo('courses.create-assessment', course);
    }
  }

});
