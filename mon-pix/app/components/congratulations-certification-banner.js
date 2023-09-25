import Component from '@glimmer/component';

export default class CongratulationsCertificationBanner extends Component {
  get numberOfEligibleComplementaryCertifications() {
    return this.args.certificationEligibility.complementaryCertifications?.filter(c => !c.isOutdated).length ?? 0;
  }

  get numberOfOutdatedComplementaryCertifications() {
    return this.args.certificationEligibility.complementaryCertifications?.filter(c => c.isOutdated).length ?? 0;
  }
}
