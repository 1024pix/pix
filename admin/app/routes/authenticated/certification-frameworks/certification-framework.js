import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class CertificationFrameworkRoute extends Route {
  @service store;
  @service router;

  model(params) {
    const certificationFrameworks = this.store.peekAll('certification-framework');
    return certificationFrameworks.find((cf) => cf.scope === params.certification_framework_key);
  }
}
