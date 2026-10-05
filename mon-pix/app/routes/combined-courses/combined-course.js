import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CombinedCourseRoute extends Route {
  @service session;
  @service store;
  @service router;
  @service metrics;

  async beforeModel(transition) {
    const { code } = this.paramsFor(this.routeName);

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
    const combinedCourse = await this.store.queryRecord('combined-course', { filter: { code } });
    return {
      code,
      organizationId: combinedCourse.organizationId,
    };
  }
}
