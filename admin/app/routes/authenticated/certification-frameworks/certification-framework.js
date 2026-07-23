import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificationFrameworkRoute extends Route {
  @service store;
  @service router;

  async model(params) {
    const certificationFrameworks = this.store.peekAll('certification-framework');
    const certificationFramework = certificationFrameworks.find(
      (cf) => cf.scope === params.certification_framework_key,
    );
    if (certificationFramework.belongsTo('complementaryCertification').link() !== null) {
      await certificationFramework.belongsTo('complementaryCertification').load();
    }
    return certificationFramework;
  }
}
