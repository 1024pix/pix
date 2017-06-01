import Ember from 'ember';
import RSVP from 'rsvp';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  assessmentService: Ember.inject.service('assessment'),

  model(params) {
    const store = this.get('store');

    const assessmentId = params.assessment_id;
    const challengeId = params.challenge_id;

    return RSVP.hash({
      assessment: store.findRecord('assessment', assessmentId),
      challenge: store.findRecord('challenge', challengeId),
      answers: store.queryRecord('answer', { assessment: assessmentId, challenge: challengeId })
    });
  },

  afterModel(model) {
    return model.assessment.get('course').then((course) => {
      model.progress = course.getProgress(model.challenge);
      return model;
    });
  },

  serialize(model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id
    };
  },

  _createAnswer(answerValue, answerTimeout, currentChallenge, assessment, answerElapsedTime) {
    return this.get('store').createRecord('answer', {
      value: answerValue,
      timeout: answerTimeout,
      challenge: currentChallenge,
      elapsedTime: answerElapsedTime,
      assessment
    });
  },

  _urlForNextChallenge(adapter, assessmentId, currentChallengeId) {
    return adapter.buildURL('assessment', assessmentId) + '/next/' + currentChallengeId;
  },

  _navigateToNextView(currentChallenge, assessment) {
    const adapter = this.get('store').adapterFor('application');
    return adapter.ajax(this._urlForNextChallenge(adapter, assessment.get('id'), currentChallenge.get('id')), 'GET')
      .then(nextChallenge => {
        if (nextChallenge) {
          return this.transitionTo('assessments.get-challenge', assessment.get('id'), nextChallenge.data.id);
        } else {
          return this.transitionTo('assessments.get-results', assessment.get('id'));
        }
      });
  },

  actions: {

    saveAnswerAndNavigate(currentChallenge, assessment, answerValue, answerTimeout, answerElapsedTime) {
      const answer = this._createAnswer(answerValue, answerTimeout, currentChallenge, assessment, answerElapsedTime);
      return answer.save().then(() => {
        return this._navigateToNextView(currentChallenge, assessment);
      });
    }
  },

});
