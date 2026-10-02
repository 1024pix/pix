import Route from '@ember/routing/route';
import { service } from '@ember/service';
export default class CombinedCoursePresentationRoute extends Route {
  @service session;
  @service store;
  @service router;
  @service accessStorage;
  @service metrics;

  async model() {
    const { code } = this.modelFor('combined-courses.combined-course');
    return this.store.queryRecord('combined-course', { filter: { code } });
  }

  async afterModel(combinedCourse) {
    const { code, organizationId } = combinedCourse;
    try {
      await this.store.adapterFor('combined-course').reassessStatus(code);
    } catch (err) {
      if (err.errors[0].code === 403) {
        this.router.replaceWith('combined-courses.generic-error');
      }
      throw err;
    } finally {
      this.accessStorage.clear(organizationId);
    }
  }

  activate() {
    this.metrics.context.code = this.paramsFor('combined-courses.combined-course').code;
    this.metrics.context.type = 'combined-course';
  }

  deactivate() {
    delete this.metrics.context.code;
    delete this.metrics.context.type;
  }
}
