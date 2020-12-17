import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { certificationIssueReportCategories, certificationIssueReportSubcategories } from 'pix-certif/models/certification-issue-report';

export class RadioButtonCategory {
  @tracked isChecked;
  @tracked name;

  constructor({ name, isChecked = false }) {
    this.name = name;
    this.isChecked = isChecked;
  }

  toggle(categoryNameBeingChecked) {
    this.isChecked = this.name === categoryNameBeingChecked;
  }
}

export class RadioButtonCategoryWithDescription extends RadioButtonCategory {
  @tracked description;

  toggle(categoryNameBeingChecked) {
    super.toggle(categoryNameBeingChecked);
    this.description = '';
  }

  issueReport(certificationReport) {
    return {
      category: this.name,
      description: this.description,
      certificationReport,
    };
  }
}

export class RadioButtonCategoryWithSubcategoryWithDescription extends RadioButtonCategory {
  @tracked subcategory;
  @tracked description = null;

  constructor({ name, subcategory }) {
    super({ name });
    this.subcategory = subcategory;
  }

  toggle(categoryNameBeingChecked) {
    super.toggle(categoryNameBeingChecked);
    this.description = null;
  }

  issueReport(certificationReport) {
    return {
      category: this.name,
      subcategory: this.subcategory,
      description: this.description,
      certificationReport,
    };
  }
}

export default class ExaminerReportModal extends Component {
  @service store

  @tracked otherCategory = new RadioButtonCategoryWithDescription({ name: certificationIssueReportCategories.OTHER });
  @tracked lateOrLeavingCategory = new RadioButtonCategoryWithSubcategoryWithDescription({
    name: certificationIssueReportCategories.LATE_OR_LEAVING,
    subcategory: certificationIssueReportSubcategories.LEFT_EXAM_ROOM,
  });
  @tracked candidateInformationChangeCategory = new RadioButtonCategoryWithSubcategoryWithDescription({
    name: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
    subcategory: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
  });
  @tracked connexionOrEndScreenCategory = new RadioButtonCategoryWithSubcategoryWithDescription({
    name: certificationIssueReportCategories.CONNEXION_OR_END_SCREEN,
    subcategory: certificationIssueReportSubcategories.SKIP_QUESTION_MISSING_TIME,
  });
  categories = [ this.otherCategory, this.lateOrLeavingCategory, this.candidateInformationChangeCategory, this.connexionOrEndScreenCategory ];

  @tracked reportLength = 0;
  @tracked showCategoryMissingError = false;

  @action
  toggleOnCategory(selectedCategory) {
    this.showCategoryMissingError = false;
    this.categories.forEach((category) => category.toggle(selectedCategory.name));
  }

  @action
  async submitReport(event) {
    event.preventDefault();
    const categoryToAdd = this.categories.find((category) => category.isChecked);
    if (categoryToAdd) {
      const issueReportToSave = this.store.createRecord('certification-issue-report', categoryToAdd.issueReport(this.args.report));
      await issueReportToSave.save();
      this.args.closeModal();
    } else {
      this.showCategoryMissingError = true;
    }
  }

  @action
  handleTextareaChange(e) {
    this.reportLength = e.target.value.length;
  }
}
