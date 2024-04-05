import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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

  get outdatedLowerLevelComplementaryCertifications() {
    return (
      this.args.certificationEligibility.complementaryCertifications?.filter(
        (complementaryCertification) =>
          complementaryCertification.isOutdated && !complementaryCertification.isAcquiredExpectedLevel,
      ) ?? []
    );
  }

  @action
  closeBanner() {
    this.displayCongratulationsBanner = false;
  }
}
