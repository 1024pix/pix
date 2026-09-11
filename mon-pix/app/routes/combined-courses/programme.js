import Route from '@ember/routing/route';
import { service } from '@ember/service';
export default class CombinedCourseProgrammeRoute extends Route {
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
  }

  activate() {
    this.metrics.context.code = this.paramsFor('combined-courses.programme').code;
    this.metrics.context.type = 'combined-course';
  }

  deactivate() {
    delete this.metrics.context.code;
    delete this.metrics.context.type;
  }
}
