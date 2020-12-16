import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { certificationIssueReportCategories } from 'pix-certif/models/certification-issue-report';

class RadioButtonCategory {
  @tracked isChecked;
  @tracked name;

  constructor({ name }) {
    this.name = name;
    this.isChecked = false;
  }

  toggle(categoryNameToBeingCheck) {
    this.isChecked = this.name === categoryNameToBeingCheck;
  }

  issueReport(certificationReport) {
    return {
      category: this.name,
      description: this.description,
      certificationReport,
    };
  }
}

class RadioButtonCategoryWithDescription extends RadioButtonCategory {
  @tracked description;

  toggle(categoryNameToBeingCheck) {
    super.toggle(categoryNameToBeingCheck);
    this.description = '';
  }
}

export default class ExaminerReportModal extends Component {
  @service store

  @tracked otherCategory = new RadioButtonCategoryWithDescription({ name: certificationIssueReportCategories.OTHER });
  @tracked lateOrLeavingCategory = new RadioButtonCategoryWithDescription({ name: certificationIssueReportCategories.LATE_OR_LEAVING });
  @tracked candidateInformationChangeCategory = new RadioButtonCategoryWithDescription({ name: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES });
  @tracked connexionOrEndScreenCategory = new RadioButtonCategoryWithDescription({ name: certificationIssueReportCategories.CONNEXION_OR_END_SCREEN });
  categories = [ this.otherCategory, this.lateOrLeavingCategory, this.candidateInformationChangeCategory, this.connexionOrEndScreenCategory ];

  @tracked reportLength = 0;

  @action
  toggleOnCategory(selectedCategory) {
    this.categories.forEach((category) => category.toggle(selectedCategory.name));
  }

  @action
  async submitReport(event) {
    event.preventDefault();
    const categoryToAdd = this.categories.find((category) => category.isChecked);
    const issueReportToSave = this.store.createRecord('certification-issue-report', categoryToAdd.issueReport(this.args.report));
    await issueReportToSave.save();
    this.args.closeModal();
  }

  @action
  handleTextareaChange(e) {
    this.reportLength = e.target.value.length;
  }
}
