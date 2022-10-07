import Component from '@glimmer/component';

export default class CertificationCenterMemberships extends Component {
  get orderedCertificationCenterMemberships() {
    return this.args.certificationCenterMemberships.sortBy('certificationCenter.name');
  }
}
