import Route from '@ember/routing/route';
import RSVP from 'rsvp';

export default class ResultsRoute extends Route {
  model() {
    return this.modelFor('assessments').reload();
  }

  async afterModel(assessment) {
    if (assessment.isCertification) {
      return this.transitionTo('index');
    }
    const answers = await assessment.answers;
    await RSVP.all([
      ...answers.map((answer) => answer.challenge),
      ...answers.map((answer) => answer.correction),
    ]);
  }
}
