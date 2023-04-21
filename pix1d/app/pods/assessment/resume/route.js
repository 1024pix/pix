import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ResumeRoute extends Route {
  @service router;
  @service store;

  redirect(assessment, transition) {
    if (transition.to.queryParams.assessmentHasNoMoreQuestions === 'true') {
      return this._completeAssessment(assessment);
    }
    return this.router.replaceWith('assessment.challenge', assessment.id);
  }

  async _completeAssessment(assessment) {
    await assessment.save();
    return this._routeToResults(assessment);
  }

  _routeToResults(assessment) {
    return this.router.replaceWith('assessment.results', assessment.id);
  }
}
