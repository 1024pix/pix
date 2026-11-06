import Route from '@ember/routing/route';
import { service } from '@ember/service';

const ALLOWED_PREVIOUS_ROUTES = [
  'campaigns.assessment.results',
  // End of a combined course campaign: results page is skipped (see assessments.resume#_rateAssessment).
  // Ember doesn't wait for the async `redirect` hook of assessments.resume, so the resume route is
  // already active when the redirection to /chargement happens.
  'assessments.resume',
];

export default class CombinedCoursePresentationRoute extends Route {
  @service router;

  async beforeModel(transition) {
    const { code } = this.modelFor('combined-courses.combined-course');

    if (!transition.from || !ALLOWED_PREVIOUS_ROUTES.includes(transition.from.name)) {
      return this.router.replaceWith('combined-courses.combined-course.presentation', code);
    }
  }

  async model() {
    const { code } = this.modelFor('combined-courses.combined-course');
    return code;
  }
}
