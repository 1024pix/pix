import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  session: Ember.inject.service(),

  model(params) {

    const store = this.get('store');
    return store.findRecord('course', params.course_id).then((course) => {

      // FIXME : add (route?) tests
      const userName = `${this.get('session.firstname')} ${this.get('session.lastname')}`;
      const userEmail = this.get('session.email');

      const assessment = store.createRecord('assessment', { course, userName, userEmail });
      return RSVP.hash({
        assessment: assessment.save(),
        challenge: course.get('challenges.firstObject')
      });
    });
  },

  afterModel(model) {
    // FIXME: manage the case when assessment's course has no challenge
    this.transitionTo('assessments.get-challenge', model);
  }

});
