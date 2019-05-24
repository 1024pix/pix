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
      answer: store.queryRecord('answer', { assessment: assessmentId, challenge: challengeId })
    }).catch((err) => {
      const meta = ('errors' in err) ? err.errors.get('firstObject').meta : null;
      if (meta.field === 'authorization') {
        return this.transitionTo('index');
      }
    });
  },

  async afterModel(modelResult) {
    if (modelResult.assessment.get('isSmartPlacement')) {
      const campaignCode = modelResult.assessment.codeCampaign;
      const campaigns = await this._findCampaigns({ campaignCode });
      modelResult.campaign = campaigns.get('firstObject');
    }
  },

  serialize(model) {
    return {
      assessment_id: model.assessment.id,
      challenge_id: model.challenge.id
    };
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
