import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  textareaMaxLength: 500,

  hasCheckedEverything: computed('certificationReports.@each.hasSeenEndTestScreen', function() {
    if (this.certificationReports.length === 0) {
      return false;
    }

    const presentCertificationReports = this.certificationReports
      .filter((certificationReport) => !certificationReport.isMissing);

    if (presentCertificationReports.length === 0) {
      return false;
    }

    return presentCertificationReports.every((certificationReport) => certificationReport.hasSeenEndTestScreen);
  }),

  hasCheckedSomething: computed('certificationReports.@each.hasSeenEndTestScreen', function() {
    if (this.certificationReports.length === 0) {
      return false;
    }

    return this.certificationReports.any((certificationReport) => certificationReport.hasSeenEndTestScreen);
  }),

  actions: {
    toggleAllHasSeenEndTestScreen() {
      const toggled = !this.get('hasCheckedEverything');

      this.certificationReports.forEach((certificationReport) => {
        if (!certificationReport.isMissing) {
          certificationReport.set('hasSeenEndTestScreen', toggled);
        }
      });
    }
  },

});
