import Ember from 'ember';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

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
