import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class FrameworksRoute extends Route {
  @service store;
  @service router;

  beforeModel(transition) {
    console.log('COUCOUCOCUOCUC');
    console.log(transition.to);
    console.log(transition.from);
    console.log(transition.data);
    return super.beforeModel(transition);
  }

  async model(params) {
    console.log('redirection');
    this.certificationFrameworkKey = params.certification_framework_key;
    if (params.certification_framework_key === 'CLEA') {
      return {
        frameworkKey: this.certificationFrameworkKey,
      };
    }

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

  redirect(model, transition) {
    console.log('redirect model');
    if (transition.to.name === 'authenticated.certification-frameworks.frameworks') {
      if (this.certificationFrameworkKey === 'CLEA') {
        this.router.transitionTo('authenticated.certification-frameworks.target-profile');
      }
    }
  }
}
