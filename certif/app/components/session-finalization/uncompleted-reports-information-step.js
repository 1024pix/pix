import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class UncompletedReportsInformationStep extends Component {
  @tracked reportToEdit = null;
  @tracked showAddIssueReportModal = false;
  @tracked showIssueReportsModal = false;
  @service notifications;
  @service intl;

  get certificationReportsAreNotEmpty() {
    return this.args.certificationReports.length !== 0;
  }

  get abortOptions() {
    return [
      {
        label: this.intl.t(
          'pages.session-finalization.reporting.uncompleted-reports-information.table.labels.abandonment'
        ),
        value: 'candidate',
      },
      {
        label: this.intl.t(
          'pages.session-finalization.reporting.uncompleted-reports-information.table.labels.technical-problem'
        ),
        value: 'technical',
      },
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
