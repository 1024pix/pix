import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class UncompletedReportsInformationStep extends Component {

  @tracked reportToEdit = null;
  @tracked showAddIssueReportModal = false;
  @tracked showIssueReportsModal = false;

  get certificationReportsAreNotEmpty() {
    return this.args.certificationReports.length !== 0;
  }

  get abortOptions() {
    return [
      { label: 'Abandon du candidat', value: 'candidate' },
      { label: 'Problème technique', value: 'technical' },
    ];
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

  @action
  onChangeAbortReason(event) {
    if (event.target.value) {
      this.args.onChangeAbortReason(event.target.value);
    }
  }
}
