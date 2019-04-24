import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import UnauthenticatedRouteMixin from 'ember-simple-auth/mixins/unauthenticated-route-mixin';

export default Route.extend(UnauthenticatedRouteMixin, {

  session: service(),
  store: service(),

  beforeModel() {
    if (this.get('session.isAuthenticated')) {
      return this.store
        .findRecord('user', this.get('session.data.authenticated.userId'))
        .then((connectedUser) => {

          if (connectedUser.get('organizations.length')) {
            this.transitionTo('board');
          }
          if (connectedUser.get('usesProfileV2')) {
            return this.replaceWith('profilv2');
          }
          else {
            this.transitionTo('compte');
          }
        });
    } else {
      this.transitionTo('login');
    }
  },

  model() {
    return this.store.query('course', { isCourseOfTheWeek: false, isAdaptive: false });
  },

  setupController(controller, model) {
    this._super(controller, model);
    this.controllerFor('index').set('session', this.session);
  },

  actions: {
    startCourse(course) {
      this.transitionTo('courses.create-assessment', course.get('id'));
    }
  }

});
