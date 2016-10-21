import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  session: Ember.inject.service(),

  model(params) {

    const store = this.get('store');
    return store.findRecord('course', params.course_id).then((course) => {

      // FIXME : add (route?) tests
      const userName = `${this.get('session.user.firstName')} ${this.get('session.user.lastName')}`;
      const userEmail = this.get('session.user.email');

      return store
        .createRecord('assessment', { course, userName, userEmail })
        .save()
        .then((assessment) => {
          return RSVP.hash({
            assessment,
            challenge: assessment.get('firstChallenge')
          });
        });
    });
  },

  afterModel(model) {
    // FIXME: manage the case when assessment's course has no challenge
    this.transitionTo('assessments.get-challenge', model);
  }

});
