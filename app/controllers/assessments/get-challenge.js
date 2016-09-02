import Ember from 'ember';

export default Ember.Controller.extend({

  assessmentService: Ember.inject.service('assessment'),

  saveAnswerAndNavigate(currentChallenge, assessment, answerValue) {

    const answer = this._createAnswer(answerValue, currentChallenge, assessment);
    answer.save().then(() => {
      this._navigateToNextView(currentChallenge, assessment);
    });
  },

  _createAnswer: function (answerValue, currentChallenge, assessment) {

    return this.get('store').createRecord('answer', {
      value: answerValue,
      challenge: currentChallenge,
      assessment
    });
  },

  _navigateToNextView(currentChallenge, assessment) {

    this.get('assessmentService').getNextChallenge(currentChallenge, assessment).then((challenge) => {
      if (challenge) {
        return this.transitionToRoute('assessments.get-challenge', { challenge, assessment });
      }
      return this.transitionToRoute('assessments.get-results', { assessment });
    });
  }

});
