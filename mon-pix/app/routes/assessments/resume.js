import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend({

  afterModel(assessment) {
    return this.get('store')
      .queryRecord('challenge', { assessmentId: assessment.get('id') })
      .then((nextChallenge) => {
        if (nextChallenge) {
          this.transitionTo('assessments.challenge', assessment.get('id'), nextChallenge.get('id'));
        } else {
          this.transitionTo('assessments.rating', assessment.get('id'));
        }
      });
  }
});
