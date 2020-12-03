import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { certificationIssueReportCategoriesLabel } from 'pix-certif/models/certification-issue-report';

export default class ExaminerReportModal extends Component {
  @service store

  @tracked isReportOfTypeOtherChecked = false;
  @tracked isReportOfTypeLateOrLeavingChecked = false;
  @tracked reportLength = 0;
  @tracked currentIssueReport = {};

  constructor() {
    super(...arguments);
    const certificationReport = this.args.report;
    const certificationIssueReports = certificationReport.certificationIssueReports;
    if (certificationIssueReports && certificationIssueReports.length) {
      this.currentIssueReport = certificationIssueReports[0];
      this.reportLength = this.currentIssueReport.description.length;
      if (this.currentIssueReport.category === certificationIssueReportCategoriesLabel.OTHER) {
        this.isReportOfTypeOtherChecked = true;
      } else {
        this.isReportOfTypeLateOrLeavingChecked = true;
      }
    } else {
      this.currentIssueReport = { certificationReport: this.args.report };
    }
  }

  @action
  toggleShowReportOfTypeOther() {
    this.isReportOfTypeOtherChecked = !this.isReportOfTypeOtherChecked;
    this.currentIssueReport.description = null;
    this.reportLength = 0;
    if (this.isReportOfTypeOtherChecked) {
      this.isReportOfTypeLateOrLeavingChecked = false;
      this.currentIssueReport.category = certificationIssueReportCategoriesLabel.OTHER;
    }
  }

  @action
  toggleShowReportOfTypeLateOrLeaving() {
    this.isReportOfTypeLateOrLeavingChecked = !this.isReportOfTypeLateOrLeavingChecked;
    this.currentIssueReport.description = null;
    this.reportLength = 0;
    if (this.isReportOfTypeLateOrLeavingChecked) {
      this.isReportOfTypeOtherChecked = false;
      this.currentIssueReport.category = certificationIssueReportCategoriesLabel.LATE_OR_LEAVING;
    }
  }

  @action
  async submitReport(event) {
    event.preventDefault();
    const issueReportToSave = this.store.createRecord('certification-issue-report', this.currentIssueReport);
    await issueReportToSave.save();
    this.args.closeModal();
  }

  @action
  handleTextareaChange(e) {
    this.reportLength = e.target.value.length;
  }
}
