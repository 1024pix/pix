import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Index extends Component {
  @tracked displayCongratulationsBanner = true;

  get showCongratulationsBanner() {
    return this.displayCongratulationsBanner;
  }

  get eligibleComplementaryCertifications() {
    return (
      this.args.certificationEligibility.complementaryCertifications?.filter(
        (complementaryCertification) => !complementaryCertification.isOutdated,
      ) ?? []
    );
  }

  get outdatedAndNotAcquiredComplementaryCertifications() {
    return (
      this.args.certificationEligibility.complementaryCertifications?.filter(
        (complementaryCertification) => complementaryCertification.isOutdated && !complementaryCertification.isAcquired,
      ) ?? []
    );
  }

  @action
  closeBanner() {
    this.displayCongratulationsBanner = false;
  }
}
