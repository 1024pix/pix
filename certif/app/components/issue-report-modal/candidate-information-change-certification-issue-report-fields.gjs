import { PixSelect, PixTextarea } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import t from 'ember-intl/helpers/t';
import {
  certificationIssueReportSubcategories,
  subcategoryToCode,
  subcategoryToLabel,
  subcategoryToTextareaLabel,
} from 'pix-certif/models/certification-issue-report';

export default class CandidateInformationChangeCertificationIssueReportFieldsComponent extends Component {
  @service intl;

  @tracked
  subcategoryTextAreaLabel = this.intl.t(
    subcategoryToTextareaLabel[this.args.candidateInformationChangeCategory.subcategory],
  );

  @action
  onChangeSubcategory(option) {
    this.args.candidateInformationChangeCategory.subcategory = option;
    this.subcategoryTextAreaLabel = this.intl.t(subcategoryToTextareaLabel[option]);
  }

  options = [
    {
      value: certificationIssueReportSubcategories.NAME_OR_BIRTHDATE,
      label: `${subcategoryToCode[certificationIssueReportSubcategories.NAME_OR_BIRTHDATE]} ${this.intl.t(
        subcategoryToLabel[certificationIssueReportSubcategories.NAME_OR_BIRTHDATE],
      )}`,
    },
    {
      value: certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE,
      label: `${subcategoryToCode[certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE]} ${this.intl.t(
        subcategoryToLabel[certificationIssueReportSubcategories.EXTRA_TIME_PERCENTAGE],
      )}`,
    },
  ];

  <template>
    <fieldset class='candidate-information-change-certification-issue-report-fields'>
      <div class='candidate-information-change-certification-issue-report-fields__radio-button'>
        <input
          id='input-radio-for-category-candidate-information-change'
          type='radio'
          name='candidate-information-change'
          checked={{@candidateInformationChangeCategory.isChecked}}
          {{on 'click' (fn @toggleOnCategory @candidateInformationChangeCategory)}}
        />
        <label for='input-radio-for-category-candidate-information-change'><span
          >{{@candidateInformationChangeCategory.categoryCode}}&nbsp;</span>{{@candidateInformationChangeCategory.categoryLabel}}</label>
      </div>
      {{#if @candidateInformationChangeCategory.isChecked}}
        <div class='candidate-information-change-certification-issue-report-fields__details'>
          <PixSelect
            @id='subcategory-for-category-candidate-information-change'
            @options={{this.options}}
            @value={{@candidateInformationChangeCategory.subcategory}}
            @onChange={{this.onChangeSubcategory}}
          >
            <:label>{{t 'pages.session-finalization.add-issue-modal.actions.select-subcategory'}}</:label>
          </PixSelect>
          <PixTextarea
            @id='text-area-for-category-candidate-information-change'
            @value={{@candidateInformationChangeCategory.description}}
            @maxlength={{@maxlength}}
            required='true'
            {{on 'change' @updateCandidateInformationChangeCategoryDescription}}
          >
            <:label>{{this.subcategoryTextAreaLabel}}</:label>
          </PixTextarea>
        </div>
      {{/if}}
    </fieldset>
  </template>
}
