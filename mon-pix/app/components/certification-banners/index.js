import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class Index extends Component {
  @tracked displayCongratulationsBanner = true;

  get showCongratulationsBanner() {
    return this.displayCongratulationsBanner;
  }

  get eligibleComplementaryCertifications() {
    return this.args.certificationEligibility.complementaryCertifications?.filter((c) => !c.isOutdated) ?? [];
  }

  get outdatedComplementaryCertifications() {
    return this.args.certificationEligibility.complementaryCertifications?.filter((c) => c.isOutdated) ?? [];
  }

  @action
  closeBanner() {
    this.displayCongratulationsBanner = false;
  }
}
