import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FrameworksRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    const certificationFrameworks = await this.store.findAll('certification-framework');

    const currentCertificationFramework = certificationFrameworks.find(
      (certificationFramework) =>
        certificationFramework.name.toLowerCase() === params.certification_framework_key.toLowerCase(),
    );

    if (!currentCertificationFramework || params.certification_framework_key === 'CLEA') {
      this.router.transitionTo('authenticated.certification-frameworks');
    }
    const frameworkHistory = await this.store.queryRecord('framework-history', params.certification_framework_key);

    return {
      frameworkHistory,
      frameworkKey: params.certification_framework_key,
      currentCertificationFramework,
      hasTargetProfilesHistory: params.certification_framework_key !== 'CORE',
    };
  }
}
