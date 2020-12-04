import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';

class RadioButtonCategory {
  @tracked isChecked;
  @tracked name;

  constructor() {
    this.isChecked = false;
  }
}

export default class ExaminerReportModal extends Component {
  @service store

  @tracked otherCategory = new RadioButtonCategory();
  @tracked lateOrLeavingCategory = new RadioButtonCategory();
  @tracked candidateInformationsChangesCategory = new RadioButtonCategory();
  @tracked connexionOrEndScreenCategory = new RadioButtonCategory();
  @tracked currentIssueReport = {
    category: null,
    description: null,
    certificationReport: null,
  };
  @tracked reportLength = 0;

  constructor() {
    super(...arguments);
    this.otherCategory.name = certificationIssueReportCategories.OTHER;
    this.lateOrLeavingCategory.name = certificationIssueReportCategories.LATE_OR_LEAVING;
    this.candidateInformationsChangesCategory.name = certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES;
    this.connexionOrEndScreenCategory.name = certificationIssueReportCategories.CONNEXION_OR_END_SCREEN;

    const certificationReport = this.args.report;
    const certificationIssueReports = certificationReport.certificationIssueReports;
    const existingIssueReport = certificationIssueReports && certificationIssueReports[0];

    if (existingIssueReport) {
      this.currentIssueReport = existingIssueReport;
      this.reportLength = existingIssueReport.description.length
        ? existingIssueReport.description.length
        : 0;

      switch (existingIssueReport.category) {
        case certificationIssueReportCategories.OTHER:
          this.otherCategory.isChecked = true;
          break;

        case certificationIssueReportCategories.LATE_OR_LEAVING:
          this.lateOrLeavingCategory.isChecked = true;
          break;

        case certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES:
          this.candidateInformationsChangesCategory.isChecked = true;
          break;

        case certificationIssueReportCategories.CONNEXION_OR_END_SCREEN:
          this.connexionOrEndScreenCategory.isChecked = true;
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
      this._toggleOffAllCategoryExceptOne(category.name);
      this.currentIssueReport.category = category.name;
    }
  }

  _resetAllCurrentIssueReportData() {
    delete this.currentIssueReport.description;
    this.reportLength = 0;
  }

  _toggleOffAllCategoryExceptOne(categoryToExcludeName) {
    this.otherCategory.isChecked = this.otherCategory.name === categoryToExcludeName;
    this.lateOrLeavingCategory.isChecked = this.lateOrLeavingCategory.name === categoryToExcludeName;
    this.candidateInformationsChangesCategory.isChecked = this.candidateInformationsChangesCategory.name === categoryToExcludeName;
    this.connexionOrEndScreenCategory.isChecked = this.connexionOrEndScreenCategory.name === categoryToExcludeName;
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
