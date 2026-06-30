import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class AttachTargetProfileNewRoute extends Route {
  @service accessControl;

  beforeModel() {
    this.accessControl.restrictAccessTo(
      ['isSuperAdmin'],
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );
  }

  model(_) {
    const { currentComplementaryCertification } = this.modelFor(
      'authenticated.certification-frameworks.certification-framework.target-profile',
    );

    return {
      complementaryCertification: currentComplementaryCertification,
      currentTargetProfile: null,
    };
  }
}
