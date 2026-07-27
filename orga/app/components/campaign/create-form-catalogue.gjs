import PixButton from '@1024pix/pix-ui/components/pix-button';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import FormSection from '../ui/form-section';
import AssessmentGoalCustomization from './create-form/assessment-goal-customization';
import AssessmentGoalSettings from './create-form/assessment-goal-settings';
import CampaignGoals from './create-form/campaign-goals';
import CombinedCourseGoalSettings from './create-form/combined-course-goal-settings';
import ProfilesCollectionGoalCustomization from './create-form/profiles-collection-goal-customization';
import ProfilesCollectionGoalSettings from './create-form/profiles-collection-goal-settings';

export default class CreateForm extends Component {
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

  get displaysSettingsSection() {
    return this.isCampaignGoalProfileCollection || Boolean(this.args.campaign.course);
  }

  get displaysCustomizationSection() {
    if (this.isCampaignGoalProfileCollection) return true;
    if (this.isAssessmentGoalSelected) return Boolean(this.args.campaign.course);
    return false;
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

      <CampaignGoals @campaign={{@campaign}} @errors={{@errors}} @hasBlueprints={{@hasBlueprints}} />

      {{#if this.displaysSettingsSection}}
        <FormSection @title={{t "pages.campaign-creation.settings.title"}}>
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
      {{/if}}

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
