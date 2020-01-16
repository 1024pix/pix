import Component from '@glimmer/component';
import { computed } from '@ember/object';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SessionFinalizationCandidatesInformationsStep extends Component {

  @tracked hasCheckedEverything;

  constructor() {
    super(...arguments);

    this.textareaMaxLength = 500;
    this.hasCheckedEverything = false;
  }

  @computed('args.certificationCandidates.@each.hasSeenEndTestScreen')
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

  @computed('args.certificationCandidates.@each.hasSeenEndTestScreen')
  get hasCheckedSomething() {
    if (!this.args.certificationCandidates || this.args.certificationCandidates.length === 0) {
      return false;
    }

    return this.args.certificationCandidates.any((certificationCandidate) => certificationCandidate.hasSeenEndTestScreen);
  }

  @action
  toggleAllHasSeenEndTestScreen() {
    const toggled = !this.hasCheckedSomething;

    this.args.certificationCandidates.forEach((certificationCandidate) => {
      if (!certificationCandidate.isMissing) {
        certificationCandidate.hasSeenEndTestScreen = toggled;
      }
    });
  }

}
