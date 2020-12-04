import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { certificationIssueReportCategoriesLabel } from 'pix-certif/models/certification-issue-report';

class RadioButtonCategory {
  @tracked isChecked;
  @tracked label;

  constructor() {
    this.isChecked = false;
  }
}

export default class ExaminerReportModal extends Component {
  @service store

  @tracked otherCategory = new RadioButtonCategory();
  @tracked lateOrLeavingCategory = new RadioButtonCategory();
  @tracked currentIssueReport = {
    category: null,
    description: null,
    certificationReport: null,
  };
  @tracked reportLength = 0;

  constructor() {
    super(...arguments);
    this.otherCategory.label = certificationIssueReportCategoriesLabel.OTHER;
    this.lateOrLeavingCategory.label = certificationIssueReportCategoriesLabel.LATE_OR_LEAVING;
    const certificationReport = this.args.report;
    const certificationIssueReports = certificationReport.certificationIssueReports;
    const existingIssueReport = certificationIssueReports && certificationIssueReports[0];

    if (existingIssueReport) {
      this.currentIssueReport = existingIssueReport;
      this.reportLength = existingIssueReport.description.length
        ? existingIssueReport.description.length
        : 0;

      switch (existingIssueReport.category) {
        case certificationIssueReportCategoriesLabel.OTHER:
          this.otherCategory.isChecked = true;
          break;

        case certificationIssueReportCategoriesLabel.LATE_OR_LEAVING:
          this.lateOrLeavingCategory.isChecked = true;
          break;

        default:
          break;
      }
    } else {
      this.currentIssueReport = { certificationReport: this.args.report };
    }
  }

  @action
  toggleOnCategory(category) {
    category.isChecked = !category.isChecked;
    this._resetAllCurrentIssueReportData();
    if (category.isChecked) {
      this._toggleOffAllCategoryExceptOne(category.label);
      this.currentIssueReport.category = category.label;
    }
  }

  _resetAllCurrentIssueReportData() {
    delete this.currentIssueReport.description;
    this.reportLength = 0;
  }

  _toggleOffAllCategoryExceptOne(categoryToExcludeLabel) {
    this.otherCategory.isChecked = this.otherCategory.label === categoryToExcludeLabel;
    this.lateOrLeavingCategory.isChecked = this.lateOrLeavingCategory.label === categoryToExcludeLabel;
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
