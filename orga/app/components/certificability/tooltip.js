import Component from '@glimmer/component';
import { service } from '@ember/service';

export default class Tooltip extends Component {
  @service currentUser;
  @service intl;

  get certificabilityDescription() {
    if (this.args.hasComputeOrganizationLearnerCertificabilityEnabled) {
      return this.intl.t('components.certificability-tooltip.from-compute-certificability');
    }

    return this.intl.t('components.certificability-tooltip.from-collect-notice');
  }
}
