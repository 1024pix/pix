import { PixButton, PixModal, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import eq from 'ember-truth-helpers/helpers/eq';
import CandidateInformationChangeCertificationIssueReportFields from 'pix-certif/components/issue-report-modal/candidate-information-change-certification-issue-report-fields';
import FraudCertificationIssueReportFields from 'pix-certif/components/issue-report-modal/fraud-certification-issue-report-fields';
import InChallengeCertificationIssueReportFields from 'pix-certif/components/issue-report-modal/in-challenge-certification-issue-report-fields';
import NonBlockingCandidateIssueCertificationIssueReportFields from 'pix-certif/components/issue-report-modal/non-blocking-candidate-issue-certification-issue-report-fields';
import NonBlockingTechnicalIssueCertificationIssueReportFields from 'pix-certif/components/issue-report-modal/non-blocking-technical-issue-certification-issue-report-fields';
import SignatureIssueReportFields from 'pix-certif/components/issue-report-modal/signature-issue-report-fields';
import {
  categoryToCode,
  categoryToLabel,
  certificationIssueReportCategories,
  certificationIssueReportSubcategories,
  subcategoryToCode,
  subcategoryToLabel,
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
  changeQuestionNumber(value) {
    this.inChallengeCategory.questionNumber = value;
  }

  @action
  updateCandidateInformationChangeCategory(event) {
    this.candidateInformationChangeCategory.description = event.target.value;
  }

  @action
  updateNonBlockingCandidateIssueCategory(event) {
    this.nonBlockingCandidateIssueCategory.description = event.target.value;
  }

  @action
  updateNonBlockingTechnicalIssueCategory(event) {
    this.nonBlockingTechnicalIssueCategory.description = event.target.value;
  }

  @action
  updateSignatureIssueCategory(event) {
    this.signatureIssueCategory.description = event.target.value;
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
      categoryToAdd.issueReport(this.args.report),
    );
    try {
      await issueReportToSave.save();
      this.args.closeModal();
    } catch {
      issueReportToSave.rollbackAttributes();
      this.showIssueReportSubmitError = true;
    }
  }

  <template>
    <PixModal
      @showModal={{@showModal}}
      class='add-issue-report-modal'
      @title='{{t "pages.session-finalization.add-issue-modal.title"}} {{@report.firstName}} {{@report.lastName}}'
      @onCloseButtonClick={{@closeModal}}
    >
      <:content>
        <form
          id='add-issue-report-form'
          {{on 'submit' this.submitReport}}
          class='pix-modal__container pix-modal__container--white'
        >
          <div class='add-issue-report-modal-content'>
            <CandidateInformationChangeCertificationIssueReportFields
              @candidateInformationChangeCategory={{this.candidateInformationChangeCategory}}
              @toggleOnCategory={{this.toggleOnCategory}}
              @maxlength={{@maxlength}}
              @updateCandidateInformationChangeCategoryDescription={{this.updateCandidateInformationChangeCategory}}
            />

            <SignatureIssueReportFields
              @signatureIssueCategory={{this.signatureIssueCategory}}
              @toggleOnCategory={{this.toggleOnCategory}}
              @maxlength={{@maxlength}}
              @updateSignatureIssueCategoryDescription={{this.updateSignatureIssueCategory}}
            />

            <FraudCertificationIssueReportFields
              @fraudCategory={{this.fraudCategory}}
              @toggleOnCategory={{this.toggleOnCategory}}
            />

            <NonBlockingTechnicalIssueCertificationIssueReportFields
              @nonBlockingTechnicalIssueCategory={{this.nonBlockingTechnicalIssueCategory}}
              @toggleOnCategory={{this.toggleOnCategory}}
              @maxlength={{@maxlength}}
              @updateNonBlockingTechnicalIssueCategoryDescription={{this.updateNonBlockingTechnicalIssueCategory}}
            />

            <NonBlockingCandidateIssueCertificationIssueReportFields
              @nonBlockingCandidateIssueCategory={{this.nonBlockingCandidateIssueCategory}}
              @toggleOnCategory={{this.toggleOnCategory}}
              @maxlength={{@maxlength}}
              @updateNonBlockingCandidateIssueCategoryDescription={{this.updateNonBlockingCandidateIssueCategory}}
            />

            {{#if (eq @version 2)}}
              <InChallengeCertificationIssueReportFields
                @changeQuestionNumber={{this.changeQuestionNumber}}
                @inChallengeCategory={{this.inChallengeCategory}}
                @toggleOnCategory={{this.toggleOnCategory}}
                @maxlength={{@maxlength}}
              />
            {{/if}}
          </div>

          {{#if this.showCategoryMissingError}}
            <PixNotificationAlert @type='error'>{{t
                'pages.session-finalization.add-issue-modal.actions.select-category'
              }}</PixNotificationAlert>
          {{/if}}

          {{#if this.showIssueReportSubmitError}}
            <PixNotificationAlert @type='error'>{{t
                'pages.session-finalization.add-issue-modal.errors.add-reporting'
              }}</PixNotificationAlert>
          {{/if}}
        </form>
      </:content>
      <:footer>
        <PixButton @triggerAction={{@closeModal}} @variant='secondary' @isBorderVisible={{true}}>
          {{t 'common.actions.cancel'}}</PixButton>
        <PixButton
          form='add-issue-report-form'
          @type='submit'
          aria-label={{t 'pages.session-finalization.add-issue-modal.actions.add-reporting'}}
        >{{t 'common.actions.validate'}}</PixButton>
      </:footer>
    </PixModal>
  </template>
}
