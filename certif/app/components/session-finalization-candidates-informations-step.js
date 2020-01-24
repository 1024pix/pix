import Component from '@glimmer/component';

export default class SessionFinalizationCandidatesInformationsStep extends Component {

  constructor() {
    super(...arguments);

    this.textareaMaxLength = 500;
  }

  get hasCheckedEverything() {
    if (!this.args.certificationCandidates || this.args.certificationCandidates.length === 0) {
      return false;
    }

    const presentCertificationCandidates = this.args.certificationCandidates
      .filter((certificationCandidate) => !certificationCandidate.isMissing);

    if (presentCertificationCandidates.length === 0) {
      return false;
    }

    return presentCertificationCandidates.every((certificationCandidate) => certificationCandidate.hasSeenEndTestScreen);
  }

  get hasCheckedSomething() {
    if (!this.args.certificationCandidates || this.args.certificationCandidates.length === 0) {
      return false;
    }

    return this.args.certificationCandidates.any((certificationCandidate) => certificationCandidate.hasSeenEndTestScreen);
  }

}
