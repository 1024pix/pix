import Component from '@glimmer/component';

export default class Index extends Component {
  get eligibleComplementaryCertifications() {
    return this.args.certificationEligibility.complementaryCertifications?.filter((c) => !c.isOutdated) ?? [];
  }

  get outdatedComplementaryCertifications() {
    return this.args.certificationEligibility.complementaryCertifications?.filter((c) => c.isOutdated) ?? [];
  }
}
