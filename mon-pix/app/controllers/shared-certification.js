import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class SharedCertificationController extends Controller {
  @service featureToggles;

  get displayV3CertificationShared() {
    return this.featureToggles.featureToggles?.isV3CertificationPageEnabled && this.model.version === 3;
  }
}
