import { inject as service } from '@ember/service';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  delay: service(),

  model() {
    return this.store.query('course', { isAdaptive: true });
  },

  actions: {
    startCourse(course) {
      this.transitionTo('courses.create-assessment', course.get('id'));
    }
  }

});
