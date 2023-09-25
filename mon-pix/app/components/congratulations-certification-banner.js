import Component from '@glimmer/component';

export default class CongratulationsCertificationBanner extends Component {
  get isEligible() {
    return this.args.certificationEligibility.complementaryCertifications?.length > 0;
  }
}
