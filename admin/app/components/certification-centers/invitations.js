import Component from '@glimmer/component';

export default class CertificationCenterInvitations extends Component {
  get sortedCertificationCenterInvitations() {
    return this.args.certificationCenterInvitations.sortBy('updatedAt').reverse();
  }
}
