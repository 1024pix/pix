import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  model(params) {
    const store = this.get('store');
    return store.findRecord('course', params.course_id).then((course) => {
      const assessment = store.createRecord('assessment', { course });
      return RSVP.hash({
        assessment: assessment.save(),
        challenge: course.get('challenges.firstObject')
      });
    });
  },

  afterModel(model) {
    this.transitionTo('assessments.get-challenge', model);
  }

});
