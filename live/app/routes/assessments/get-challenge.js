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
    }).catch((err) => {
      const meta = ('errors' in err) ? err.errors.get('firstObject').meta : null;
      if (meta.field === 'authorization') {
        return this.transitionTo('index');
      }
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

  _findOrCreateAnswer(challenge, assessment) {
    let answer = assessment.get('answers').findBy('challenge.id', challenge.get('id'));
    if (!answer) {
      answer = this.get('store').createRecord('answer', {
        assessment: assessment,
        challenge: challenge
      });
    }
    return answer;
  },

  _urlForNextChallenge(adapter, assessmentId, challengeId) {
    return adapter.buildURL('assessment', assessmentId) + '/next/' + challengeId;
  },

  _navigateToNextView(challenge, assessment) {
    const adapter = this.get('store').adapterFor('application');
    return adapter.ajax(this._urlForNextChallenge(adapter, assessment.get('id'), challenge.get('id')), 'GET')
      .then(nextChallenge => {
        if (nextChallenge) {
          return this.transitionTo('assessments.get-challenge', assessment.get('id'), nextChallenge.data.id);
        } else {
          return this.transitionTo('assessments.get-results', assessment.get('id'));
        }
      });
  },

  actions: {

    saveAnswerAndNavigate(challenge, assessment, answerValue, answerTimeout, answerElapsedTime) {
      const answer = this._findOrCreateAnswer(challenge, assessment);
      answer.setProperties({
        value: answerValue,
        timeout: answerTimeout,
        elapsedTime: answerElapsedTime
      });
      return answer.save()
        .then(() => {
          return this._navigateToNextView(challenge, assessment);
        }).catch((err) => {
          alert(`Erreur lors de l’enregistrement de la réponse : ${err}`);
          return err;
        });
    }
  },

});
