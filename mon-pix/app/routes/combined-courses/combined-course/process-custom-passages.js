import Route from '@ember/routing/route';
import { service } from '@ember/service';
export default class CombinedCoursePresentationRoute extends Route {
  @service router;

  async beforeModel(transition) {
    const ALLOWED_PREVIOUS_ROUTES = ['campaigns.assessment.results', 'assessments.resume'];

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
