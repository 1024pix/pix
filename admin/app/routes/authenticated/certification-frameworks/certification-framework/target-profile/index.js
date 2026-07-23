import Route from '@ember/routing/route';

export default class TargetProfileIndexRoute extends Route {
  model() {
    const certificationFramework = this.modelFor(
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );
    return certificationFramework.belongsTo('complementaryCertification').load();
  }
}
