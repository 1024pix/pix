import { inject as service } from '@ember/service';
import RSVP from 'rsvp';
import BaseRoute from 'mon-pix/routes/base-route';
import ENV from 'mon-pix/config/environment';

export default BaseRoute.extend({

  session: service(),

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

  afterModel(modelResult) {
    const requiredDatas = {};

    const userId = this.get('session.data.authenticated.userId');
    const campaignCode = modelResult.assessment.codeCampaign;

    if (modelResult.assessment.get('isPlacement')
      || modelResult.assessment.get('isPreview')
      || modelResult.assessment.get('isDemo')
    ) {

      return Promise.resolve(modelResult);
    }

    if (modelResult.assessment.get('isCertification')) {
      requiredDatas.user = this._getUser(userId);
      return RSVP.hash(requiredDatas)
        .then((hash) => {
          modelResult.user = hash.user;
          return modelResult;
        });
    }

    if (modelResult.assessment.get('isSmartPlacement')) {
      requiredDatas.campaigns = this._findCampaigns({ campaignCode });

      return RSVP.hash(requiredDatas)
        .then((hash) => {
          modelResult.campaign = hash.campaigns.get('firstObject');
          modelResult.user = null;
          return modelResult;
        });
    }

  },

  serialize(model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id
    };
  },

  _getUser(userId) {
    return this.get('store').findRecord('user', userId);
  },

  _findAnswers({ assessmentId, challengeId }) {
    return this.get('store').queryRecord('answer', { assessment: assessmentId, challenge: challengeId });
  },

  _findCampaigns({ campaignCode }) {
    return this.get('store').query('campaign', { filter: { code: campaignCode } });
  },

  _findOrCreateAnswer(challenge, assessment) {
    let answer = assessment.get('answers').findBy('challenge.id', challenge.get('id'));
    if (!answer) {
      answer = this.get('store').createRecord('answer', { assessment, challenge });
    }
    return answer;
  },

  _getNextChallenge(assessment, challenge) {
    return this.get('store')
      .queryRecord('challenge', { assessmentId: assessment.get('id'), challengeId: challenge.get('id') });
  },

  _hasReachedCheckpoint(assessment) {
    return assessment.get('answers.length') % ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT === 0;
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
        .then(() => this._getNextChallenge(assessment, challenge))
        .then((nextChallenge) => {
          if (nextChallenge) {
            if (assessment.get('hasCheckpoints') && this._hasReachedCheckpoint(assessment)) {
              return this.transitionTo('assessments.checkpoint', assessment.get('id'));
            }
            this.transitionTo('assessments.challenge', { assessment, challenge: nextChallenge });
          } else {
            this.transitionTo('assessments.rating', assessment.get('id'));
          }
        })
        .catch(() => {
          this.send('error');
        });
    },
    error() {
      return true;
    }
  }
});
