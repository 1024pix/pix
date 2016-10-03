import Ember from 'ember';

export default Ember.Controller.extend({

  assessmentService: Ember.inject.service('assessment'),

  navigate(challenge, assessment) {
    this.get('assessmentService').getNextChallenge(challenge, assessment).then((nextChallenge) => {
      this.transitionToRoute('courses.get-challenge-preview', { challenge: nextChallenge, assessment });
    });
  }

});
