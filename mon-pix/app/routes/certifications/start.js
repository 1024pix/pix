import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  actions: {
    error(error) {
      if (error.errors[0].status === '403') {
        return this.render('certifications.start-error');
      } else {
        this.transitionTo('index');
      }
    },

    submit(certificationCourseId) {
      return this.replaceWith('certifications.resume', certificationCourseId);
    }
  },
});
