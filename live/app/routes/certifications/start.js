import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  authenticationRoute: '/connexion',
  actions: {
    error(error) {
      if (error.errors[0].status === '403') {
        return this.render('certifications.start-error');
      } else {
        this.transitionTo('index');
      }
    },

    submit(certificationCourse) {
      return this.replaceWith('courses.create-assessment', certificationCourse.id);
    }
  }
});
