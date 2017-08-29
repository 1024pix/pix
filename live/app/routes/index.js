import Ember from 'ember';
import BaseRoute from 'pix-live/routes/base-route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default BaseRoute.extend(UnauthenticatedRouteMixin, {

  session: Ember.inject.service(),
  store: Ember.inject.service(),

  beforeModel() {
    if(this.get('session.isAuthenticated')) {
      return this.get('store')
        .findRecord('user', this.get('session.data.authenticated.userId'))
        .then((connectedUser) => {

          if(connectedUser.get('organizations.length')) {
            this.transitionTo('board');
          } else {
            this.transitionTo('compte');
          }
        });
    }
  },

  model() {
    return {
      coursesOfTheWeek:   this.get('store').query('course', { isCourseOfTheWeek: true }),
      progressionCourses: this.get('store').query('course', { isCourseOfTheWeek: false, isAdaptive: false })
    };
  },

  actions: {
    startCourse(course) {
      this.transitionTo('courses.create-assessment', course.get('id'));
    }
  }

});
