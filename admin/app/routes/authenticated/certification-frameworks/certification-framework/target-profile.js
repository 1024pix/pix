import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class TargetProfileRoute extends Route {
  @service store;

  async model() {
    const { frameworkHistory, frameworkKey, currentCertificationFramework, hasTargetProfilesHistory } = this.modelFor(
      'authenticated.certification-frameworks.certification-framework',
    );
    const complementaryCertifications = await this.store.findAll('complementary-certification');
    const currentComplementaryCertification = complementaryCertifications.find((cc) => cc.key === frameworkKey);
    return {
      frameworkHistory,
      frameworkKey,
      currentCertificationFramework,
      hasTargetProfilesHistory,
      currentComplementaryCertification,
    };
  }
}
