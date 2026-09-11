import Route from '@ember/routing/route';
import { service } from '@ember/service';
export default class CombinedCoursePresentationRoute extends Route {
  @service router;

  async beforeModel(transition) {
    const { code } = transition.to.params;

    if (!transition.from || transition.from.name !== 'campaigns.assessment.results') {
      return this.router.replaceWith('combined-courses.programme', code);
    }
  }

  model(params) {
    return params.code;
  }
}
