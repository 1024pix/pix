import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ResumeRoute extends Route {
  @service router;
  @service store;

  redirect(assessment, transition) {
    if (transition.from.name === 'challenge-preview') {
      return this.router.replaceWith('/');
    }
    if (transition.to.queryParams.assessmentHasNoMoreQuestions === 'true') {
      return this._routeToResults(assessment);
    }
    return this.router.replaceWith('assessment.challenge', assessment.id);
  }

  _routeToResults(assessment) {
    return this.router.replaceWith('assessment.results', assessment.id);
  }
}
