import RSVP from 'rsvp';
import Route from '@ember/routing/route';

export default Route.extend({

  model(params) {
    const store = this.store;

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

    const campaignCode = modelResult.assessment.codeCampaign;

    if (modelResult.assessment.get('isPlacement')
      || modelResult.assessment.get('isPreview')
      || modelResult.assessment.get('isDemo')
    ) {

      return Promise.resolve(modelResult);
    }

    if (modelResult.assessment.get('isCertification')) {
      requiredDatas.user = this._getUser();
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
    return modelResult;

  },

  serialize(model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id
    };
  },

  _getUser() {
    return this.store.queryRecord('user', { profile: true });
  },

  _findCampaigns({ campaignCode }) {
    return this.store.query('campaign', { filter: { code: campaignCode } });
  },

  _findOrCreateAnswer(challenge, assessment) {
    let answer = assessment.get('answers').findBy('challenge.id', challenge.get('id'));
    if (!answer) {
      answer = this.store.createRecord('answer', { assessment, challenge });
    }
    return answer;
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
        .then(
          () => this.transitionTo('assessments.resume', assessment.get('id')),
          () => {
            answer.rollbackAttributes();
            return this.send('error');
          }
        );
    },
    error() {
      return true;
    }
  }
});
