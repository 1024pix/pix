import Ember from 'ember';
import RSVP from 'rsvp';

export default Ember.Route.extend({

  assessmentService: Ember.inject.service('assessment'),

  model(params) {
    const store = this.get('store');

    const assessmentId = params.assessment_id;
    const challengeId = params.challenge_id;

    const promises = {
      assessment: store.findRecord('assessment', assessmentId),
      challenge: store.findRecord('challenge', challengeId),
      answers: store.queryRecord('answer', { assessment: assessmentId, challenge: challengeId })
    };

    return RSVP.hash(promises).then(model => {
      return this._addProgressToModel(model);
    });
  },

  serialize(model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id
    };
  },

  actions: {

    saveAnswerAndNavigate(currentChallenge, assessment, answerValue, answerTimeout) {
      const answer = this._createAnswer(answerValue, answerTimeout, currentChallenge, assessment);
      answer.save().then(() => {
        this._navigateToNextView(currentChallenge, assessment);
      });
    }
  },

  _createAnswer(answerValue, answerTimeout, currentChallenge, assessment) {
    return this.get('store').createRecord('answer', {
      value: answerValue,
      timeout: answerTimeout,
      challenge: currentChallenge,
      assessment
    });
  },

  _urlForNextChallenge(adapter, assessmentId, currentChallengeId) {
    return adapter.buildURL('assessment', assessmentId) + '/next/' + currentChallengeId;
  },

  _navigateToNextView(currentChallenge, assessment) {
    const adapter = this.get('store').adapterFor('application');
    adapter.ajax(this._urlForNextChallenge(adapter, assessment.get('id'), currentChallenge.get('id')), 'GET')
      .then(nextChallenge => {
        if (nextChallenge) {
          this.transitionTo('assessments.get-challenge', assessment.get('id'), nextChallenge.data.id);
        } else {
          this.transitionTo('assessments.get-results', assessment.get('id'));
        }
      });
  },

  _addProgressToModel(model) {
    return model.assessment.get('course').then((course) => {
      model.progress = course.getProgress(model.challenge);
      return model;
    });
  }

});
