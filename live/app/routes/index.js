import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

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
