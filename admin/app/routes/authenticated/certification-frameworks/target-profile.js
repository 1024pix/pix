import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class TargetProfileRoute extends Route {
  @service store;

  async model(params) {
    const complementaryCertifications = await this.store.findAll('complementary-certification');
    return complementaryCertifications.find((cc) => cc.key === params.certification_framework_key);
  }
}
