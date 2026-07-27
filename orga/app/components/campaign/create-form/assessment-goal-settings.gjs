import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { not } from 'ember-truth-helpers';

import ExplanationCard from '../../ui/explanation-card';
import FormField from '../../ui/form-field';
import PixFieldset from '../../ui/pix-fieldset';
import CampaignName from './campaign-name';
import CampaignOwner from './campaign-owner';
import ExternalId from './external-id';
import MultipleSendings from './multiple-sendings';

export default class AssessmentGoalSettings extends Component {
  @service currentUser;

  get isExamModeFieldEnabled() {
    return this.currentUser.prescriber.enableCampaignWithoutUserProfile;
  }

  get isMultipleSendingAssessmentEnabled() {
    return this.currentUser.prescriber.enableMultipleSendingAssessment;
  }

  get isCampaignGoalExam() {
    return this.args.campaign.type === 'EXAM';
  }

  @action
  selectExamModeStatus(value) {
    if (value) {
      this.args.campaign.setType('EXAM');
    } else {
      this.args.campaign.setType('ASSESSMENT');
    }
  }

  <template>
    {{#if @campaign.course}}
      <CampaignName @campaign={{@campaign}} @errors={{@errors}} />

      <CampaignOwner @campaign={{@campaign}} @membersSortedByFullName={{@membersSortedByFullName}} />

      {{#if this.isExamModeFieldEnabled}}
        <FormField>
          <:default>
            <PixFieldset @required={{true}} aria-labelledby="exam-mode-label" role="radiogroup">
              <:title>{{t "pages.campaign-creation.exam-mode.label"}}</:title>
              <:content>
                <PixRadioButton
                  name="exam-mode-label"
                  @value="false"
                  {{on "change" (fn this.selectExamModeStatus false)}}
                  aria-describedby="campaign-goal-exam-info"
                  checked={{not this.isCampaignGoalExam}}
                >
                  <:label>{{t "pages.campaign-creation.no"}}</:label>
                </PixRadioButton>

                <PixRadioButton
                  name="exam-mode-label"
                  @value="true"
                  {{on "change" (fn this.selectExamModeStatus true)}}
                  aria-describedby="campaign-goal-exam-info"
                  checked={{this.isCampaignGoalExam}}
                >
                  <:label>{{t "pages.campaign-creation.yes"}}</:label>
                </PixRadioButton>
              </:content>
            </PixFieldset>
          </:default>
          <:information>
            <ExplanationCard id="campaign-goal-exam-info">
              <:title>{{t "pages.campaign-creation.purpose.exam"}}</:title>
              <:message>
                {{t "pages.campaign-creation.purpose.exam-info"}}
              </:message>
            </ExplanationCard>
          </:information>
        </FormField>
      {{/if}}

      {{#if this.isMultipleSendingAssessmentEnabled}}
        <MultipleSendings
          @campaign={{@campaign}}
          @labelKey="pages.campaign-creation.multiple-sendings.assessments.question-label"
          @infoKey="pages.campaign-creation.multiple-sendings.assessments.info"
        />
      {{/if}}

      <ExternalId @campaign={{@campaign}} @errors={{@errors}} />
    {{/if}}
  </template>
}
