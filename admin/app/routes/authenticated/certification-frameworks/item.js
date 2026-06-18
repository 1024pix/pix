import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class ItemRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    this.certificationFrameworkKey = params.certification_framework_key;

    const certificationFrameworks = this.store.peekAll('certification-framework');
    const currentCertificationFramework = certificationFrameworks.find(
      (cf) => cf.name === params.certification_framework_key,
    );

    let currentComplementaryCertification;
    if (params.certification_framework_key === 'CLEA') {
      const complementaryCertifications = await this.store.findAll('complementary-certification');
      currentComplementaryCertification = complementaryCertifications.find(
        (cc) => cc.key === params.certification_framework_key,
      );
    }

    const frameworkHistory = await this.store.queryRecord('framework-history', this.certificationFrameworkKey);

    return {
      frameworkHistory,
      frameworkKey: this.certificationFrameworkKey,
      currentCertificationFramework,
      currentComplementaryCertification,
      hasTargetProfilesHistory: params.certification_framework_key !== 'CORE',
    };
  }

  redirect(model, transition) {
    if (transition.to.name === 'authenticated.certification-frameworks.item.index') {
      if (this.certificationFrameworkKey !== 'CLEA') {
        this.router.transitionTo('authenticated.certification-frameworks.item.frameworks');
      } else {
        this.router.transitionTo('authenticated.certification-frameworks.item.target-profile');
      }
    }
  }
}
