import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class CompletedReportsInformationStep extends Component {
  @tracked reportToEdit = null;
  @tracked showAddIssueReportModal = false;
  @tracked showIssueReportsModal = false;

  get certificationReportsAreNotEmpty() {
    return this.args.certificationReports.length !== 0;
  }

  get hasCheckedEverything() {
    const allCertifReportsAreCheck = this.args.certificationReports.every((report) => report.hasSeenEndTestScreen);
    return this.certificationReportsAreNotEmpty && allCertifReportsAreCheck;
  }

  get hasCheckedSomething() {
    const hasOneOrMoreCheck = this.args.certificationReports.any((report) => report.hasSeenEndTestScreen);
    return this.certificationReportsAreNotEmpty && hasOneOrMoreCheck;
  }

  get headerCheckboxStatus() {
    return this.hasCheckedEverything ? 'checked' : this.hasCheckedSomething ? 'partial' : 'unchecked';
  }

  @action
  openAddIssueReportModal(report) {
    this.showIssueReportsModal = false;
    this.showAddIssueReportModal = true;
    this.reportToEdit = report;
  }

  @action
  openIssueReportsModal(report) {
    this.showAddIssueReportModal = false;
    this.showIssueReportsModal = true;
    this.reportToEdit = report;
  }

  @action
  closeAddIssueReportModal() {
    this.showAddIssueReportModal = false;
  }

  @action
  closeIssueReportsModal() {
    this.showIssueReportsModal = false;
  }
}
