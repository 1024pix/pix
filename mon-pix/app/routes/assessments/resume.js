import BaseRoute from 'mon-pix/routes/base-route';
import ENV from 'mon-pix/config/environment';

export default BaseRoute.extend({

  hasSeenCheckpoint: false,
  campaignCode: null,

  _hasReachedCheckpoint(assessment) {
    return assessment.get('answers.length') > 0 &&
      assessment.get('answers.length') % ENV.APP.NUMBER_OF_CHALLENGE_BETWEEN_TWO_CHECKPOINTS_IN_SMART_PLACEMENT === 0;
  },

  beforeModel({ queryParams }) {
    this.set('hasSeenCheckpoint', queryParams.hasSeenCheckpoint);
    this.set('campaignCode', queryParams.campaignCode);
    return this._super(...arguments);
  },

  afterModel(assessment) {
    return this.get('store')
      .queryRecord('challenge', { assessmentId: assessment.get('id') })
      .then((nextChallenge) => {
        if (nextChallenge) {
          const nbCurrentAnswers = assessment.get('nbCurrentAnswers');

          if (assessment.get('hasCheckpoints') && this._hasReachedCheckpoint(assessment) && !this.get('hasSeenCheckpoint')) {
            assessment.set('nbCurrentAnswers', 0);
            return this.replaceWith('assessments.checkpoint', assessment.get('id'));
          }

          assessment.set('nbCurrentAnswers', nbCurrentAnswers + 1);

          this.replaceWith('assessments.challenge', assessment.get('id'), nextChallenge.get('id'));
        } else {
          if (assessment.get('hasCheckpoints') && !this.get('hasSeenCheckpoint') && !assessment.get('isCompleted')) {
            return this.replaceWith('assessments.checkpoint', assessment.get('id'), { queryParams: { finalCheckpoint: true } });
          }

          this.replaceWith('assessments.rating', assessment.get('id'));
        }
      });
  },

  actions: {
    loading(transition, originRoute) {
      // allows the loading template to be shown or not
      return originRoute._router.currentRouteName !== 'assessments.challenge';
    }
  }
});
