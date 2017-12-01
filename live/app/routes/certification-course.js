import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  session: service('session'),

  model() {

    return this.get('store').findRecord('user', this.get('session.data.authenticated.userId'), { reload: true })
      .then(() => {
        return this.get('store').createRecord('certification-course', {}).save();
      });
  },

  redirect(certificationCourse) {
    return this.replaceWith('courses.create-assessment', certificationCourse);
  },

  actions: {
    error() {
      this.transitionTo('index');
    }
  }

});
