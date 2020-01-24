import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  textareaMaxLength: 500,

  certifReportsAreNotEmpty: computed('certificationReports', function() {
    return this.certificationReports.length !== 0;
  }),

  hasCheckedEverything: computed('certificationReports.@each.hasSeenEndTestScreen', function() {
    const allCertifReportsAreCheck = this.certificationReports.every((report) => report.hasSeenEndTestScreen);
    return this.certifReportsAreNotEmpty && allCertifReportsAreCheck;
  }),

  hasCheckedSomething: computed('certificationReports.@each.hasSeenEndTestScreen', function() {
    const hasOneOrMoreCheck = this.certificationReports.any((report) => report.hasSeenEndTestScreen);
    return this.certifReportsAreNotEmpty && hasOneOrMoreCheck;
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
