import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default Route.extend({

  session: service('session'),

  model(params) {
    return this.get('store').findRecord('user', this.get('session.data.authenticated.userId'), { reload: true })
      .then(() => {
        return this.get('store').createRecord('course', { sessionCode: params.code }).save();
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
