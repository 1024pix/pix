import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificationFrameworkRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    this.certificationFrameworkKey = params.certification_framework_key;

    const certificationFrameworks = this.store.peekAll('certification-framework');
    const currentCertificationFramework = certificationFrameworks.find(
      (cf) => cf.name === params.certification_framework_key,
    );

    const frameworkHistory = await this.store.queryRecord('framework-history', this.certificationFrameworkKey);

    return {
      frameworkHistory,
      frameworkKey: this.certificationFrameworkKey,
      currentCertificationFramework,
      hasTargetProfilesHistory: params.certification_framework_key !== 'CORE',
    };
  }
}
