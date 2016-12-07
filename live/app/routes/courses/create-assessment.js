import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  model(params) {

    const store = this.get('store');

    return store.findRecord('course', params.course_id).then((course) => {

      // No auth yet, therefore userName and userEmail are null.
      return store
        .createRecord('assessment', { course, userName:null, userEmail:null })
        .save()
        .then((assessment) => {
          return RSVP.hash({
            assessment
          });
        });
    });
  },

  afterModel(model) {
    // FIXME: manage the case when assessment's course has no challenge
    this.transitionTo('assessments.get-challenge', model.assessment.get('id'), model.assessment.get('firstChallenge.id'));
  }

});
