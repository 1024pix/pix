import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class SessionFinalizationReportsInformationsStep extends Component {
  textareaMaxLength = 500;
  reportToEdit = null;

  @tracked
  showExaminerReportModal = false;

  get myFeatureToggle() {
    return true;
  }

  get certifReportsAreNotEmpty() {
    return this.args.certificationReports.length !== 0;
  }

  get hasCheckedEverything() {
    const allCertifReportsAreCheck = this.args.certificationReports.every((report) => report.hasSeenEndTestScreen);
    return this.certifReportsAreNotEmpty && allCertifReportsAreCheck;
  }

  get hasCheckedSomething() {
    const hasOneOrMoreCheck = this.args.certificationReports.any((report) => report.hasSeenEndTestScreen);
    return this.certifReportsAreNotEmpty && hasOneOrMoreCheck;
  }

  get headerCheckboxStatus() {
    return this.hasCheckedEverything ? 'checked' : this.hasCheckedSomething ? 'partial' : 'unchecked';
  }

  @action
  async openExaminerReportModal(report) {
    this.showExaminerReportModal = true;
    this.reportToEdit = report;
  }

  @action
  async closeExaminerReportModal() {
    this.showExaminerReportModal = false;
  }

}
