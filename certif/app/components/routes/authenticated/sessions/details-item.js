import Component from '@glimmer/component';

export default class RoutesAuthenticatedSessionsDetailsItem extends Component {

  get certificationCandidatesCount() {
    const certificationCandidatesCount = this.args.session.certificationCandidates.length;
    return certificationCandidatesCount > 0 ? `(${certificationCandidatesCount})`  : '';
  }
}
