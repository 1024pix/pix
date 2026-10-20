import Route from '@ember/routing/route';
import { service } from '@ember/service';
export default class CombinedCoursePresentationRoute extends Route {
  @service router;

  async beforeModel(transition) {
    const { code } = this.modelFor('combined-courses.combined-course');

    if (!transition.from || transition.from.name !== 'campaigns.assessment.results') {
      return this.router.replaceWith('combined-courses.combined-course.presentation', code);
    }
  }

  async model() {
    const { code } = this.modelFor('combined-courses.combined-course');
    return code;
  }
}
