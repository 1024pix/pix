import Route from '@ember/routing/route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default Route.extend(AuthenticatedRouteMixin, {

  authenticationRoute: '/connexion',

  model(params) {
    return this.get('store').createRecord('course', { sessionCode: params.code }).save();
  },

  redirect(certificationCourse) {
    return this.replaceWith('courses.create-assessment', certificationCourse);
  },

  actions: {
    error(error) {
      if (error.errors[0].status === '403') {
        return true;
      } else {
        this.transitionTo('index');
      }
    }
  }

});
