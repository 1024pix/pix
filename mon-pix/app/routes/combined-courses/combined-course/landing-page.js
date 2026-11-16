import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CombinedCourseLandingPageRoute extends Route {
  @service store;

  async model() {
    const { code } = this.modelFor('combined-courses.combined-course');
    return this.store.queryRecord('combined-course', { filter: { code } });
  }
}
