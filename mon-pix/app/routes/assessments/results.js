import BaseRoute from 'mon-pix/routes/base-route';
import RSVP from 'rsvp';

export default BaseRoute.extend({

  afterModel(assessment) {
    if (assessment.get('isCertification')) {
      return this.transitionTo('index');
    }

    return RSVP.all([
      assessment.answers,
      assessment.course
    ]).then(([answers]) => {
      return RSVP.all(answers.map((answer) => answer.challenge));
    });
  },

});
