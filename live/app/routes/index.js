import RSVP from 'rsvp';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model() {
    return RSVP.hash({
      coursesOfTheWeek: this.get('store').query('course', { isCourseOfTheWeek: true }),
      progressionCourses: this.get('store').query('course', { isCourseOfTheWeek: false, isAdaptive: false })
    });
  },

  actions: {
    startCourse(course) {
      this.transitionTo('courses.create-assessment', course);
    }
  }

});
