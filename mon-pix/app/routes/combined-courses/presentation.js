import Route from '@ember/routing/route';
import { service } from '@ember/service';
export default class CombinedCoursePresentationRoute extends Route {
  @service session;
  @service store;
  @service router;
  @service accessStorage;
  @service metrics;

  async beforeModel(transition) {
    const { code } = transition.to.params;

    if (!transition.from) {
      return this.router.replaceWith('organizations.access', code, { queryParams: { from: 'parcours' } });
    }

    const verifiedCode = await this.store.findRecord('verified-code', code);
    if (verifiedCode.type === 'campaign') {
      throw new Error();
    }

    this.session.requireAuthenticationAndApprovedTermsOfService(transition, () => {
      this.router.transitionTo('organizations.access', code);
    });
  }

  async model(params) {
    const { code } = params;
    try {
      await this.store.adapterFor('combined-course').reassessStatus(code);
      return this.store.queryRecord('combined-course', { filter: { code } });
    } catch (err) {
      if (err.errors[0].code === 403) {
        this.router.replaceWith('combined-courses.generic-error');
      }
      throw err;
    }
  }

  afterModel(combinedCourse) {
    this.accessStorage.clear(combinedCourse.organizationId);

    // POC: inside a parent, a nested course is not a destination. parentCode is only
    // set when the learner participates in that parent, so a course opened on its own
    // keeps its page, and a parent cannot redirect to itself.
    if (combinedCourse.parentCode) {
      this.router.replaceWith('combined-courses.presentation', combinedCourse.parentCode);
    }
  }

  activate() {
    this.metrics.context.code = this.paramsFor('combined-courses.presentation').code;
    this.metrics.context.type = 'combined-course';
  }

  deactivate() {
    delete this.metrics.context.code;
    delete this.metrics.context.type;
  }
}
