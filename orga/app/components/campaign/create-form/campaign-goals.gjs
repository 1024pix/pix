import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import displayCampaignErrors from '../../../helpers/display-campaign-errors';
import ExplanationCard from '../../ui/explanation-card';
import FormField from '../../ui/form-field';
import PixFieldset from '../../ui/pix-fieldset';
import CourseSelection from './course-selection';

export default class CampaignGoals extends Component {
  @service currentUser;

  get displayCourseSelection() {
    return this.isCampaignGoalAssessment || this.isCampaignGoalCombinedCourse;
  }

  get isCampaignGoalAssessment() {
    return this.args.campaign.isTypeAssessment || this.args.campaign.isTypeExam;
  }

  get isCampaignGoalProfileCollection() {
    return this.args.campaign.isProfilesCollection;
  }

  get isCampaignGoalCombinedCourse() {
    return this.args.campaign.isTypeCombinedCourse;
  }

  get isComputeLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

  get courseSelectionTab() {
    if (this.isCampaignGoalAssessment) {
      return 'targetProfile';
    }
    if (this.isCampaignGoalCombinedCourse) {
      return 'blueprint';
    }
    return 'all';
  }

  @action
  setCampaignGoal(event) {
    if (event.target.value === 'collect-participants-profile') {
      this.args.campaign.setType('PROFILES_COLLECTION');
    } else if (event.target.value === 'assess-participants') {
      this.args.campaign.setType('ASSESSMENT');
    } else if (event.target.value === 'combined-course') {
      this.args.campaign.setType('COMBINED_COURSE');
    }
  }

  <template>
    <FormField>
      <:default>
        <PixFieldset @required={{true}} aria-labelledby="campaign-goal" role="radiogroup">
          <:title>{{t "pages.campaign-creation.purpose.label"}}</:title>
          <:content>
            <PixRadioButton
              name="campaign-goal"
              @value="assess-participants"
              {{on "change" this.setCampaignGoal}}
              aria-describedby="campaign-goal-assessment-info"
              checked={{this.isCampaignGoalAssessment}}
            >
              <:label>{{t "pages.campaign-creation.purpose.assessment"}}</:label>
            </PixRadioButton>

            <PixRadioButton
              name="campaign-goal"
              @value="combined-course"
              {{on "change" this.setCampaignGoal}}
              aria-describedby="combined-course-info"
              checked={{this.isCampaignGoalCombinedCourse}}
            >
              <:label>{{t "pages.campaign-creation.purpose.combined-course"}}</:label>
            </PixRadioButton>

            <PixRadioButton
              name="campaign-goal"
              @value="collect-participants-profile"
              {{on "change" this.setCampaignGoal}}
              aria-describedby="campaign-goal-profiles-collection-info"
              checked={{this.isCampaignGoalProfileCollection}}
            >
              <:label>{{t "pages.campaign-creation.purpose.profiles-collection"}}</:label>
            </PixRadioButton>

            {{#if @errors.type}}
              <div class="form__error error-message">
                {{displayCampaignErrors @errors.type}}
              </div>
            {{/if}}
          </:content>
        </PixFieldset>
      </:default>
      <:information>
        {{#if this.isCampaignGoalAssessment}}
          <ExplanationCard id="campaign-goal-assessment-info">
            <:title>{{t "pages.campaign-creation.purpose.assessment"}}</:title>

            <:message>{{t "pages.campaign-creation.purpose.assessment-info"}}</:message>
          </ExplanationCard>
        {{else if this.isCampaignGoalCombinedCourse}}
          <ExplanationCard id="combined-course-info">
            <:title>{{t "pages.campaign-creation.purpose.combined-course"}}</:title>

            <:message>{{t "pages.campaign-creation.purpose.combined-course-info"}}</:message>
          </ExplanationCard>
        {{else if this.isCampaignGoalProfileCollection}}
          <ExplanationCard id="campaign-goal-profiles-collection-info">
            <:title>{{t "pages.campaign-creation.purpose.profiles-collection"}}</:title>

            <:message>
              {{t "pages.campaign-creation.purpose.profiles-collection-info"}}
              {{#if this.isComputeLearnerCertificabilityEnabled}}
                {{t
                  "pages.campaign-creation.purpose.profiles-collection-info-certificability-calculation"
                  linkClasses="link link--banner link--bold link--underlined"
                  htmlSafe=true
                }}
              {{/if}}
            </:message>
          </ExplanationCard>
        {{/if}}
      </:information>
    </FormField>

    {{#if this.displayCourseSelection}}
      <CourseSelection @campaign={{@campaign}} @errors={{@errors}} @tab={{this.courseSelectionTab}} />
    {{/if}}
  </template>
}
