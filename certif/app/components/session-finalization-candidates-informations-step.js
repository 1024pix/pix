import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  textareaMaxLength: 500,

  hasCheckedEverything: computed('certificationCandidates.@each.hasSeenEndTestScreen', function() {
    if (!this.certificationCandidates || this.certificationCandidates.length === 0) {
      return false;
    }

    const presentCertificationCandidates = this.certificationCandidates
      .filter((certificationCandidate) => !certificationCandidate.isMissing);

    if (presentCertificationCandidates.length === 0) {
      return false;
    }

    return presentCertificationCandidates.every((certificationCandidate) => certificationCandidate.hasSeenEndTestScreen);
  }),

  hasCheckedSomething: computed('certificationCandidates.@each.hasSeenEndTestScreen', function() {
    if (!this.certificationCandidates || this.certificationCandidates.length === 0) {
      return false;
    }

    return this.certificationCandidates.any((certificationCandidate) => certificationCandidate.hasSeenEndTestScreen);
  }),

  actions: {
    toggleAllHasSeenEndTestScreen() {
      const toggled = !this.get('hasCheckedEverything');

      this.certificationCandidates.forEach((certificationCandidate) => {
        if (!certificationCandidate.isMissing) {
          certificationCandidate.set('hasSeenEndTestScreen', toggled);
        }
      });
    }
  },

});
