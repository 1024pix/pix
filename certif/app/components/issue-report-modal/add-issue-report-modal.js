import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import {
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  categoryToLabel,
  subcategoryToLabel,
  categoryToCode,
  subcategoryToCode,
} from 'pix-certif/models/certification-issue-report';

export class RadioButtonCategory {
  @tracked isChecked;

  constructor({ name, isChecked = false, intl }) {
    this.name = name;
    this.isChecked = isChecked;
    this.categoryLabel = intl.t(categoryToLabel[name]);
    this.categoryCode = categoryToCode[name];
  }

  toggle(categoryNameBeingChecked) {
    this.isChecked = this.name === categoryNameBeingChecked;
  }

  issueReport(certificationReport) {
    return {
      category: this.name,
      certificationReport,
    };
  }
}

export class RadioButtonCategoryWithDescription extends RadioButtonCategory {
  @tracked description;

  toggle(categoryNameBeingChecked) {
    super.toggle(categoryNameBeingChecked);
    this.description = '';
  }

  issueReport(certificationReport) {
    const result = super.issueReport(certificationReport);
    return {
      ...result,
      description: this.description,
    };
  }
}

export class RadioButtonCategoryWithSubcategory extends RadioButtonCategory {
  @tracked subcategory;

  constructor({ name, subcategory, isChecked, intl }) {
    super({ name, isChecked, intl });
    this.subcategory = subcategory;
    this.subcategoryCode = subcategoryToCode[name];
  }

  get subcategoryLabel() {
    return subcategoryToLabel[this.subcategory];
  }

  issueReport(certificationReport) {
    return {
      ...super.issueReport(certificationReport),
      subcategory: this.subcategory,
    };
  }
}

export class RadioButtonCategoryWithSubcategoryWithDescription extends RadioButtonCategoryWithSubcategory {
  @tracked description = null;

  toggle(categoryNameBeingChecked) {
    super.toggle(categoryNameBeingChecked);
    this.description = null;
  }

  issueReport(certificationReport) {
    return {
      ...super.issueReport(certificationReport),
      description: this.description,
    };
  }
}

export class RadioButtonCategoryWithSubcategoryAndQuestionNumber extends RadioButtonCategoryWithSubcategory {
  @tracked questionNumber = null;

  toggle(categoryNameBeingChecked) {
    super.toggle(categoryNameBeingChecked);
    this.questionNumber = null;
  }

  issueReport(certificationReport) {
    return {
      ...super.issueReport(certificationReport),
      questionNumber: this.questionNumber,
    };
  }
}

export default class AddIssueReportModal extends Component {
  @service store;
  @service intl;

  @tracked signatureIssueCategory = new RadioButtonCategoryWithDescription({
    name: certificationIssueReportCategories.SIGNATURE_ISSUE,
    intl: this.intl,
  });

  @tracked candidateInformationChangeCategory = new RadioButtonCategoryWithSubcategoryWithDescription({
    name: certificationIssueReportCategories.CANDIDATE_INFORMATIONS_CHANGES,
    subcategory: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
    intl: this.intl,
  });

  @tracked inChallengeCategory = new RadioButtonCategoryWithSubcategoryAndQuestionNumber({
    name: certificationIssueReportCategories.IN_CHALLENGE,
    subcategory: certificationIssueReportSubcategories.IMAGE_NOT_DISPLAYING,
    intl: this.intl,
  });
  @tracked fraudCategory = new RadioButtonCategory({
    name: certificationIssueReportCategories.FRAUD,
    intl: this.intl,
  });
  @tracked nonBlockingTechnicalIssueCategory = new RadioButtonCategoryWithDescription({
    name: certificationIssueReportCategories.NON_BLOCKING_TECHNICAL_ISSUE,
    intl: this.intl,
  });
  @tracked nonBlockingCandidateIssueCategory = new RadioButtonCategoryWithDescription({
    name: certificationIssueReportCategories.NON_BLOCKING_CANDIDATE_ISSUE,
    intl: this.intl,
  });
  categories = [
    this.signatureIssueCategory,
    this.candidateInformationChangeCategory,
    this.inChallengeCategory,
    this.fraudCategory,
    this.nonBlockingTechnicalIssueCategory,
    this.nonBlockingCandidateIssueCategory,
  ];

  @tracked showCategoryMissingError = false;
  @tracked showIssueReportSubmitError = false;

  @action
  toggleOnCategory(selectedCategory) {
    this.showCategoryMissingError = false;
    this.showIssueReportSubmitError = false;
    this.categories.forEach((category) => category.toggle(selectedCategory.name));
  }

  @action
  async submitReport(event) {
    event.preventDefault();
    const categoryToAdd = this.categories.find((category) => category.isChecked);
    if (!categoryToAdd) {
      this.showCategoryMissingError = true;
      return;
    }
    const issueReportToSave = this.store.createRecord(
      'certification-issue-report',
      categoryToAdd.issueReport(this.args.report)
    );
    try {
      await issueReportToSave.save();
      this.args.closeModal();
    } catch (err) {
      issueReportToSave.rollbackAttributes();
      this.showIssueReportSubmitError = true;
    }
  }
}
