import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixFilterableAndSearchableSelect from '@1024pix/pix-ui/components/pix-filterable-and-searchable-select';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixRadioButton from '@1024pix/pix-ui/components/pix-radio-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTextarea from '@1024pix/pix-ui/components/pix-textarea';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { eq, gt, not } from 'ember-truth-helpers';
import { ID_PIX_TYPES } from 'pix-orga/helpers/id-pix-types.js';
import { orderBy } from 'pix-orga/utils/collection';

import displayCampaignErrors from '../../helpers/display-campaign-errors';
import TargetProfileDetails from '../campaign/target-profile-details';
import ExplanationCard from '../ui/explanation-card';
import FormField from '../ui/form-field';
import PixFieldset from '../ui/pix-fieldset';
export default class CreateForm extends Component {
  @service currentUser;
  @service intl;
  @service locale;
  @service store;

  @tracked wantIdPix = Boolean(this.args.campaign.externalIdLabel);

  get isMultipleSendingAssessmentEnabled() {
    return this.currentUser.prescriber.enableMultipleSendingAssessment;
  }

  get isComputeLearnerCertificabilityEnabled() {
    return this.currentUser.prescriber.computeOrganizationLearnerCertificability;
  }

  get targetOwnerOptions() {
    const options = this.args.targetProfiles.map((targetProfile) => {
      return {
        value: targetProfile.id,
        label: targetProfile.name,
        category: this.intl.t(`pages.campaign-creation.tags.${targetProfile.category}`),
        icon: targetProfile.isSimplifiedAccess ? 'accountOff' : 'users',
        iconTitle: targetProfile.isSimplifiedAccess
          ? this.intl.t('common.target-profile-details.simplified-access.without-account')
          : this.intl.t('common.target-profile-details.simplified-access.with-account'),
        order: 'OTHER' === targetProfile.category ? 1 : 0,
      };
    });
    return orderBy(options, ['order', 'category', 'label']);
  }

  get blueprintOwnerOptions() {
    const options = this.args.combinedCourseBlueprints.map((blueprint) => {
      return {
        value: blueprint.id,
        label: blueprint.name,
      };
    });
    return orderBy(options, ['label']);
  }

  get campaignOwnerOptions() {
    if (!this.args.membersSortedByFullName) return [];

    return this.args.membersSortedByFullName.map((member) => ({ value: member.id, label: member.fullName }));
  }

  get isMultipleSendingEnabled() {
    const isMulipleSendingsAllowed =
      this.isMultipleSendingAssessmentEnabled &&
      (this.isCampaignGoalAssessment || this.isCampaignGoalExam) &&
      !this.isCombinedCourseGoal;

    return this.isCampaignGoalProfileCollection || isMulipleSendingsAllowed;
  }

  get multipleSendingWording() {
    if (this.isCampaignGoalProfileCollection) {
      return {
        label: 'pages.campaign-creation.multiple-sendings.profiles.question-label',
        info: 'pages.campaign-creation.multiple-sendings.profiles.info',
      };
    } else {
      return {
        label: 'pages.campaign-creation.multiple-sendings.assessments.question-label',
        info: 'pages.campaign-creation.multiple-sendings.assessments.info',
      };
    }
  }

  get isCreateCampaignOftypeExamEnabled() {
    return this.currentUser.prescriber.enableCampaignWithoutUserProfile;
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

  get isExternalIdSelectedChecked() {
    return this.wantIdPix === true;
  }

  get isExternalIdTypeNotSelectedChecked() {
    return this.args.campaign.externalIdType === '';
  }

  get isTargetProfileSelectable() {
    return this.isCampaignGoalAssessment || this.isCampaignGoalExam;
  }

  get isCombinedCourseBlueprintSelectable() {
    return this.isCombinedCourseGoal;
  }

  get isTitleInputEnable() {
    return (this.isCampaignGoalAssessment || this.isCampaignGoalExam) && !this.isCombinedCourseGoal;
  }

  get hasCombinedCourseBlueprintShares() {
    return this.args.combinedCourseBlueprints ? this.args.combinedCourseBlueprints.length > 0 : false;
  }

  get displayOwnerField() {
    return this.isCampaignGoalAssessment || this.isCampaignGoalExam || this.isCampaignGoalProfileCollection;
  }

  @action
  askLabelIdPix() {
    this.wantIdPix = true;
    this.args.campaign.externalIdLabel = '';
    this.args.campaign.externalIdType = '';
  }

  @action
  doNotAskLabelIdPix() {
    this.wantIdPix = false;
    this.args.campaign.externalIdLabel = null;
    this.args.campaign.externalIdType = '';
  }

  @action
  selectTargetProfile(targetProfileId) {
    this.args.campaign.targetProfile = this.args.targetProfiles.find(
      (targetProfile) => targetProfile.id === targetProfileId,
    );
  }

  @action
  selectCombinedCourseBlueprint(blueprintId) {
    const record = this.store.peekRecord('combined-course-blueprint', blueprintId);
    this.args.campaign.combinedCourseBlueprint = record;
  }

  @action
  selectMultipleSendingsStatus(value) {
    this.args.campaign.multipleSendings = value;
  }

  @action
  setCampaignGoal(event) {
    if (event.target.value === 'collect-participants-profile') {
      this.args.campaign.setType('PROFILES_COLLECTION');
    } else if (event.target.value === 'exam-participants') {
      this.args.campaign.setType('EXAM');
    } else if (event.target.value === 'assess-participants') {
      this.args.campaign.setType('ASSESSMENT');
    } else if (event.target.value === 'combined-course') {
      this.args.campaign.setType('COMBINED_COURSE');
    }
  }

  @action
  onChangeCampaignValue(key, event) {
    this.args.campaign[key] = event.target.value;
  }

  @action
  onChangeCampaignOwner(newOwnerId) {
    const selectedMember = this.args.membersSortedByFullName.find((member) => newOwnerId === member.id);
    if (selectedMember) {
      this.args.campaign.ownerId = selectedMember.id;
    }
  }

  @action
  onChangeCampaignCustomLandingPageText(event) {
    this.args.campaign.customLandingPageText = event.target.value;
  }
  @action
  onChangeIdPixType(event) {
    this.args.campaign.externalIdType = event.target.value;
  }

  @action
  onSubmit(event) {
    event.preventDefault();
    this.args.onSubmit(this.args.campaign);
  }

  <template>
    <form {{on "submit" this.onSubmit}} class="form">
      <p class="form__mandatory-fields-information" aria-hidden="true">
        <abbr title={{t "common.form.mandatory-fields-title"}} class="mandatory-mark">*</abbr>
        {{t "common.form.mandatory-fields"}}
      </p>

      <FormField>
        <PixInput
          @id="campaign-name"
          @name="campaign-name"
          @requiredLabel={{t "common.form.mandatory-fields-title"}}
          type="text"
          class="input"
          maxlength="255"
          {{on "change" (fn this.onChangeCampaignValue "name")}}
          @value={{@campaign.name}}
          required={{true}}
          aria-required={{true}}
        >
          <:label>{{t "pages.campaign-creation.name.label"}}</:label>
        </PixInput>

        {{#if @errors.name}}
          <div class="form__error error-message">
            {{displayCampaignErrors @errors.name}}
          </div>
        {{/if}}
      </FormField>

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

              {{#if this.hasCombinedCourseBlueprintShares}}
                <PixRadioButton
                  name="campaign-goal"
                  @value="combined-course"
                  {{on "change" this.setCampaignGoal}}
                  aria-describedby="combined-course-info"
                  checked={{this.isCombinedCourseGoal}}
                >
                  <:label>{{t "pages.campaign-creation.purpose.combined-course"}}</:label>
                </PixRadioButton>
              {{/if}}

              {{#if this.isCreateCampaignOftypeExamEnabled}}
                <PixRadioButton
                  name="campaign-goal"
                  @value="exam-participants"
                  {{on "change" this.setCampaignGoal}}
                  aria-describedby="exam-participants-info"
                  checked={{this.isCampaignGoalExam}}
                >
                  <:label>{{t "pages.campaign-creation.purpose.exam"}}</:label>
                </PixRadioButton>
              {{/if}}

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
          {{#if this.isCampaignGoalExam}}
            <ExplanationCard id="campaign-goal-exam-info">
              <:title>{{t "pages.campaign-creation.purpose.exam"}}</:title>

              <:message>{{t "pages.campaign-creation.purpose.exam-info"}}</:message>
            </ExplanationCard>
          {{else if this.isCampaignGoalAssessment}}
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

      {{#if this.displayOwnerField}}

        <FormField>
          <:default>
            <PixSelect
              class="pix-select-owner"
              @options={{this.campaignOwnerOptions}}
              @onChange={{this.onChangeCampaignOwner}}
              @value="{{@campaign.ownerId}}"
              @isSearchable={{true}}
              @placeholder={{t "pages.campaign-creation.owner.placeholder"}}
              @locale={{this.locale.currentLocale}}
              @searchPlaceholder={{t "pages.campaign-creation.owner.search-placeholder"}}
              @requiredLabel={{t "common.form.mandatory-fields-title"}}
              @hideDefaultOption={{true}}
            >
              <:label>{{t "pages.campaign-creation.owner.label"}}</:label>
            </PixSelect>

          </:default>

          <:information>
            <ExplanationCard>
              <:title>{{t "pages.campaign-creation.owner.title"}}</:title>

              <:message>{{t "pages.campaign-creation.owner.info"}}</:message>
            </ExplanationCard>

          </:information>

        </FormField>

      {{/if}}

      {{#if this.isTargetProfileSelectable}}
        <FormField>
          <:default>
            <PixFilterableAndSearchableSelect
              @placeholder={{t "pages.campaign-creation.target-profiles-label"}}
              @categoriesPlaceholder={{t "pages.campaign-creation.target-profiles-category-placeholder"}}
              @options={{this.targetOwnerOptions}}
              @hideDefaultOption={{true}}
              @onChange={{this.selectTargetProfile}}
              @value={{@campaign.targetProfile.id}}
              @requiredLabel={{t "common.form.mandatory-fields-title"}}
              @errorMessage={{if
                @errors.targetProfile
                (t "api-error-messages.campaign-creation.target-profile-required")
              }}
              @isSearchable={{true}}
              @locale={{this.locale.currentLocale}}
              @searchLabel={{t "pages.campaign-creation.target-profiles-search-placeholder"}}
            >
              <:label>{{t "pages.campaign-creation.target-profiles-list-label"}}</:label>
              <:categoriesLabel>{{t "pages.campaign-creation.target-profiles-category-label"}}</:categoriesLabel>
            </PixFilterableAndSearchableSelect>
          </:default>
          <:information>
            {{#if @campaign.targetProfile}}
              <ExplanationCard id="target-profile-info">
                <:title>{{@campaign.targetProfile.name}}</:title>

                <:message>
                  <TargetProfileDetails
                    class="form__field-info-message"
                    @targetProfileDescription={{@campaign.targetProfile.description}}
                    @hasStages={{@campaign.targetProfile.hasStage}}
                    @hasBadges={{gt @campaign.targetProfile.thematicResultCount 0}}
                    @targetProfileTubesCount={{@campaign.targetProfile.tubeCount}}
                    @targetProfileThematicResultCount={{@campaign.targetProfile.thematicResultCount}}
                    @simplifiedAccess={{@campaign.targetProfile.isSimplifiedAccess}}
                  />
                </:message>
              </ExplanationCard>
            {{/if}}
          </:information>
        </FormField>
      {{/if}}

      {{#if this.isCombinedCourseBlueprintSelectable}}
        <FormField>
          <:default>
            <PixSelect
              @placeholder={{t "pages.campaign-creation.combined-course-blueprints-label"}}
              @options={{this.blueprintOwnerOptions}}
              @hideDefaultOption={{true}}
              @onChange={{this.selectCombinedCourseBlueprint}}
              @value={{@campaign.combinedCourseBlueprint.id}}
              @requiredLabel={{t "common.form.mandatory-fields-title"}}
              @errorMessage={{if @errors.blueprint (t "api-error-messages.campaign-creation.target-profile-required")}}
              @locale={{this.locale.currentLocale}}
              @searchLabel={{t "pages.campaign-creation.combined-course-blueprints-search-placeholder"}}
            >
              <:label>{{t "pages.campaign-creation.combined-course-blueprints-list-label"}}</:label>
            </PixSelect>
          </:default>
        </FormField>
      {{/if}}

      {{#if this.isMultipleSendingEnabled}}
        <FormField>
          <:default>
            <PixFieldset @required={{true}} aria-labelledby="multiple-sendings-label" role="radiogroup">
              <:title>{{t this.multipleSendingWording.label}}</:title>
              <:content>
                <PixRadioButton
                  name="multiple-sendings-label"
                  @value="false"
                  {{on "change" (fn this.selectMultipleSendingsStatus false)}}
                  aria-describedby="multiple-sendings-info"
                  checked={{not @campaign.multipleSendings}}
                >
                  <:label>{{t "pages.campaign-creation.no"}}</:label>
                </PixRadioButton>

                <PixRadioButton
                  name="multiple-sendings-label"
                  @value="true"
                  {{on "change" (fn this.selectMultipleSendingsStatus true)}}
                  aria-describedby="multiple-sendings-info"
                  checked={{@campaign.multipleSendings}}
                >
                  <:label>{{t "pages.campaign-creation.yes"}}</:label>
                </PixRadioButton>
              </:content>
            </PixFieldset>
          </:default>
          <:information>
            <ExplanationCard id="multiple-sendings-info">
              <:title>{{t "pages.campaign-creation.multiple-sendings.info-title"}}</:title>

              <:message>
                {{t this.multipleSendingWording.info}}
                {{#if @campaign.targetProfile.areKnowledgeElementsResettable}}
                  {{t "pages.campaign-creation.multiple-sendings.knowledge-elements-resettable"}}
                {{/if}}
              </:message>
            </ExplanationCard>
          </:information>
        </FormField>
      {{/if}}

      {{#unless this.isCombinedCourseGoal}}
        <FormField>
          <PixFieldset aria-labelledby="external-ids-label" role="radiogroup">
            <:title>{{t "pages.campaign-creation.external-id-label.question-label"}}</:title>
            <:content>
              <PixRadioButton
                name="external-id-label"
                @value="false"
                {{on "change" this.doNotAskLabelIdPix}}
                checked={{not this.isExternalIdSelectedChecked}}
              >
                <:label>{{t "pages.campaign-creation.no"}}</:label>
              </PixRadioButton>
              <PixRadioButton
                name="external-id-label"
                @value="true"
                {{on "change" this.askLabelIdPix}}
                checked={{this.isExternalIdSelectedChecked}}
              >
                <:label>{{t "pages.campaign-creation.yes"}}</:label>
              </PixRadioButton>
            </:content>
          </PixFieldset>
        </FormField>
      {{/unless}}

      {{#if this.wantIdPix}}
        <FormField>
          <PixFieldset @required={{true}} aria-labelledby="external-ids-types" role="radiogroup">
            <:title>{{t "pages.campaign-creation.external-id-type.question-label"}}</:title>
            <:content>
              <PixRadioButton
                name="external-id-types"
                @value="EMAIL"
                {{on "change" (fn this.onChangeCampaignValue "externalIdType")}}
                checked={{eq @campaign.externalIdType "EMAIL"}}
              >
                <:label>{{t ID_PIX_TYPES.EMAIL}}</:label>

              </PixRadioButton>
              <PixRadioButton
                name="external-id-types"
                @value="STRING"
                {{on "change" (fn this.onChangeCampaignValue "externalIdType")}}
                checked={{eq @campaign.externalIdType "STRING"}}
              >
                <:label>{{t ID_PIX_TYPES.STRING}}</:label>
              </PixRadioButton>
              {{#if @errors.externalIdType}}
                <div class="form__error error-message">
                  {{displayCampaignErrors @errors.externalIdType}}
                </div>
              {{/if}}
            </:content>
          </PixFieldset>
        </FormField>
        <FormField>
          <PixInput
            @id="external-id-label"
            @name="external-id-label"
            @subLabel={{t "pages.campaign-creation.external-id-label.suggestion"}}
            maxlength="255"
            @requiredLabel={{t "pages.campaign-creation.external-id-label.required"}}
            {{on "change" (fn this.onChangeCampaignValue "externalIdLabel")}}
            @value={{@campaign.externalIdLabel}}
          >
            <:label>{{t "pages.campaign-creation.external-id-label.label"}}</:label>
          </PixInput>

          {{#if @errors.externalIdLabel}}
            <div class="form__error error-message">
              {{displayCampaignErrors @errors.externalIdLabel}}
            </div>
          {{/if}}
        </FormField>
      {{/if}}

      {{#if this.isTitleInputEnable}}
        <FormField>
          <PixInput
            @id="campaign-title"
            @name="campaign-title"
            @subLabel={{t "pages.campaign-creation.test-title.sublabel"}}
            maxlength="50"
            {{on "change" (fn this.onChangeCampaignValue "title")}}
            @value={{@campaign.title}}
          >
            <:label>{{t "pages.campaign-creation.test-title.label"}}</:label></PixInput>
        </FormField>
      {{/if}}

      {{#unless this.isCombinedCourseGoal}}
        <FormField>
          <PixTextarea
            @id="custom-landing-page-text"
            @maxlength="5000"
            @value={{@campaign.customLandingPageText}}
            @subLabel={{t "pages.campaign-creation.landing-page-text.sublabel"}}
            {{on "change" this.onChangeCampaignCustomLandingPageText}}
            rows="8"
          >
            <:label>{{t "pages.campaign-creation.landing-page-text.label"}}</:label>
          </PixTextarea>
        </FormField>
      {{/unless}}

      <div class="form__validation">
        <PixButton @triggerAction={{@onCancel}} @variant="secondary">
          {{t "common.actions.cancel"}}
        </PixButton>

        <PixButton @type="submit">
          {{t "pages.campaign-creation.actions.create"}}
        </PixButton>
      </div>

      {{#if this.wantIdPix}}
        <div class="gdpr-information-external-id">
          {{t "pages.campaign-creation.legal-warning"}}
        </div>
      {{/if}}
    </form>
  </template>
}
