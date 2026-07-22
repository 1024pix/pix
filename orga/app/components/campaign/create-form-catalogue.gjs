import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import displayCampaignErrors from '../../helpers/display-campaign-errors';
import ExplanationCard from '../ui/explanation-card';
import FormField from '../ui/form-field';
import FormSection from '../ui/form-section';
import PixFieldset from '../ui/pix-fieldset';
import AssessmentGoalCustomization from './create-form/assessment-goal-customization';
import AssessmentGoalSettings from './create-form/assessment-goal-settings';
import CombinedCourseGoalSettings from './create-form/combined-course-goal-settings';
import ProfilesCollectionGoalCustomization from './create-form/profiles-collection-goal-customization';
import ProfilesCollectionGoalSettings from './create-form/profiles-collection-goal-settings';

export default class CreateForm extends Component {
  @service currentUser;

  get isComputeLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

  get isSubmitDisabled() {
    return !(this.isCampaignGoalProfileCollection || this.args.campaign.course);
  }

  get isCampaignGoalExam() {
    return this.args.campaign.type === 'EXAM';
  }

  get isCampaignGoalAssessment() {
    return this.args.campaign.type === 'ASSESSMENT';
  }

  get isCampaignGoalProfileCollection() {
    return this.args.campaign.type === 'PROFILES_COLLECTION';
  }

  get isCombinedCourseGoal() {
    return this.args.campaign.type === 'COMBINED_COURSE';
  }

  get isAssessmentGoalSelected() {
    return this.isCampaignGoalAssessment || this.isCampaignGoalExam;
  }

  get displaysCustomizationSection() {
    if (this.isCampaignGoalProfileCollection) return true;
    if (this.isAssessmentGoalSelected) return Boolean(this.args.campaign.course);
    return false;
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

  @action
  onSubmit(event) {
    event.preventDefault();
    this.args.onSubmit(this.args.campaign);
  }

  <template>
    <form {{on "submit" this.onSubmit}} class="form campaign-creation-form">
      <p class="form__mandatory-fields-information" aria-hidden="true">
        <abbr title={{t "common.form.mandatory-fields-title"}} class="mandatory-mark">*</abbr>
        {{t "common.form.mandatory-fields"}}
      </p>

      <FormSection @title={{t "pages.campaign-creation.settings.title"}}>
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
                  checked={{this.isCombinedCourseGoal}}
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
            {{else if this.isCombinedCourseGoal}}
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

        {{#if this.isAssessmentGoalSelected}}
          <AssessmentGoalSettings
            @campaign={{@campaign}}
            @errors={{@errors}}
            @membersSortedByFullName={{@membersSortedByFullName}}
          />
        {{else if this.isCombinedCourseGoal}}
          <CombinedCourseGoalSettings @campaign={{@campaign}} @errors={{@errors}} />
        {{else if this.isCampaignGoalProfileCollection}}
          <ProfilesCollectionGoalSettings
            @campaign={{@campaign}}
            @errors={{@errors}}
            @membersSortedByFullName={{@membersSortedByFullName}}
          />
        {{/if}}
      </FormSection>

      {{#if this.displaysCustomizationSection}}
        <FormSection @title={{t "pages.campaign-creation.customization.title"}}>
          {{#if this.isAssessmentGoalSelected}}
            <AssessmentGoalCustomization @campaign={{@campaign}} />
          {{else if this.isCampaignGoalProfileCollection}}
            <ProfilesCollectionGoalCustomization @campaign={{@campaign}} />
          {{/if}}
        </FormSection>
      {{/if}}

      <div class="form__validation">
        <PixButton @triggerAction={{@onCancel}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>

        <PixButton @type="submit" @isDisabled={{this.isSubmitDisabled}}>
          {{t "pages.campaign-creation.actions.create"}}
        </PixButton>
      </div>
    </form>
  </template>
}
