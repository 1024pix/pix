import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default Route.extend({

  renderTemplate() {
    this.render('assessment.results', {
      into: 'application'
    });
  },

  model() {
    return this.modelFor('assessment');
  },

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
