import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class UncompletedReportsInformationStep extends Component {

  @tracked reportToEdit = null;
  @tracked showAddIssueReportModal = false;
  @tracked showIssueReportsModal = false;

  get certifReportsAreNotEmpty() {
    return this.args.certificationReports.length !== 0;
  }

  get cancelOptions() {
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
}
