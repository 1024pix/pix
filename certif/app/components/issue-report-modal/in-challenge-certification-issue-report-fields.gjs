import { PixInput, PixSelect } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import {
  certificationIssueReportSubcategories,
  inChallengeIssueReportSubCategories,
  subcategoryToCode,
  subcategoryToLabel,
} from 'pix-certif/models/certification-issue-report';

export default class InChallengeCertificationIssueReportFields extends Component {
  @service intl;

  @action
  onChangeSubcategory(option) {
    this.args.inChallengeCategory.subcategory = option;
  }

  @action
  onChangeQuestionNumber(event) {
    this.args.changeQuestionNumber(event.target.value);
  }

  get categoryCode() {
    return this.args.inChallengeCategory.categoryCode;
  }

  options = inChallengeIssueReportSubCategories
    .map((subcategoryKey) => {
      const subcategory = certificationIssueReportSubcategories[subcategoryKey];
      const labelForSubcategory = subcategoryToLabel[subcategory];
      return {
        value: certificationIssueReportSubcategories[subcategory],
        label: `${subcategoryToCode[subcategory]} ${this.intl.t(labelForSubcategory)}`,
      };
    })
    .filter(Boolean);

  <template>
    <fieldset class='candidate-information-change-certification-issue-report-fields'>
      <div class='candidate-information-change-certification-issue-report-fields__radio-button'>
        {{! template-lint-disable require-input-label }}
        <input
          aria-label="{{t
            "pages.session-finalization.add-issue-modal.actions.select-category-label"
          }} '{{@inChallengeCategory.categoryLabel}}'"
          id='input-radio-for-category-in-challenge'
          type='radio'
          name='in-challenge'
          checked={{@inChallengeCategory.isChecked}}
          {{on 'click' (fn @toggleOnCategory @inChallengeCategory)}}
        />
        <label for='input-radio-for-category-in-challenge'><span
          >{{this.categoryCode}}&nbsp;</span>{{@inChallengeCategory.categoryLabel}}</label>
      </div>
      {{#if @inChallengeCategory.isChecked}}
        <div class='candidate-information-change-certification-issue-report-fields__details'>
          <PixInput
            name='question-number'
            type='number'
            max='64'
            @requiredLabel={{t 'common.forms.required'}}
            required='true'
            {{on 'change' this.onChangeQuestionNumber}}
            placeholder='7'
          >
            <:label>{{t 'pages.session-finalization.add-issue-modal.actions.enter-question-number'}}</:label>
          </PixInput>

          <PixSelect
            aria-label='{{t "pages.session-finalization.add-issue-modal.actions.select-subcategory-label"}}'
            @id='subcategory-for-category-in-challenge'
            @options={{this.options}}
            @value={{@inChallengeCategory.subcategory}}
            @onChange={{this.onChangeSubcategory}}
          >
            <:label>{{t 'pages.session-finalization.add-issue-modal.actions.select-subcategory'}}</:label>
          </PixSelect>
        </div>
      {{/if}}
    </fieldset>
  </template>
}
