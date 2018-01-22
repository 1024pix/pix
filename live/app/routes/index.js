import { inject as service } from '@ember/service';
import BaseRoute from 'pix-live/routes/base-route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default BaseRoute.extend(UnauthenticatedRouteMixin, {

  session: service(),
  store: service(),

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
        })
        .catch(_ => {
          this.transitionTo('logout');
        });
    }
  },

  model() {
    return this.get('store').query('course', { isCourseOfTheWeek: false, isAdaptive: false });
  },

  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor('index').set('session', this.get('session'));
  },

  actions: {
    startCourse(course) {
      this.transitionTo('courses.create-assessment', course.get('id'));
    }
  }

});
