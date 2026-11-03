import { PixButton, PixInput, PixRadioButton, PixSelect, PixTextarea } from '@1024pix/nebulix-ember';
import { concat, fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { and, not, or } from 'ember-truth-helpers';

import Card from '../card';
import CampaignCriterion from '../common/tubes-selection/campaign-criterion';
import CappedTubesCriterion from '../common/tubes-selection/capped-tubes-criterion';
import ContentSection from './form/content-section';
import SelectAttestation from './select-attestation';

export default class CombinedCourseBlueprintForm extends Component {
  @service pixToast;
  @service store;
  @service intl;
  @service router;
  @tracked blueprint;
  @tracked cappedTubeRequirements = [];
  @tracked areas;
  @tracked usesCappedTubesSelectionForCriteria = false;
  @tracked usesAllTargetProfilesForCriteria = false;
  @tracked schemaThreshold = null;

  constructor() {
    super(...arguments);
    this.blueprint = this.args.model.blueprint ?? this.store.createRecord('combined-course-blueprint');
    this.router.on('routeWillChange', () => {
      if (this.blueprint.hasDirtyAttributes && !this.blueprint.isSaving) {
        this.blueprint.unloadRecord();
      }
    });
  }

  @action
  async save() {
    if (this.cappedTubesRequirementsErrors.length) {
      this.cappedTubesRequirementsErrors.forEach((error) => {
        this.pixToast.sendErrorNotification({ message: error });
      });
      return;
    }

    if (!this.usesCappedTubesSelectionForCriteria) {
      this.cappedTubeRequirements = [];
    }

    let adapterOptions = null;
    if (this.cappedTubeRequirements.length) {
      adapterOptions = { cappedTubeRequirements: this.cappedTubeRequirements };
    } else if (this.schemaThreshold) {
      adapterOptions = { schemaThreshold: this.schemaThreshold };
    }

    try {
      await this.blueprint.save({ adapterOptions: adapterOptions });
      this.pixToast.sendSuccessNotification({
        message: this.args.updateMode
          ? this.intl.t('components.combined-course-blueprints.update.notifications.success')
          : this.intl.t('components.combined-course-blueprints.create.notifications.success'),
      });
      this.router.transitionTo('authenticated.combined-course-blueprints.list');
    } catch (responseError) {
      if (!responseError.errors) {
        return this.pixToast.sendErrorNotification({
          message: this.args.updateMode
            ? this.intl.t('components.combined-course-blueprints.update.notifications.error')
            : this.intl.t('components.combined-course-blueprints.create.notifications.error'),
        });
      }
      return responseError.errors
        .filter((error) => ['400', '404', '412', '422'].includes(error.status))
        .forEach((error) => this.pixToast.sendErrorNotification({ message: error.detail }));
    }
  }

  @action
  setData(key, e) {
    this.blueprint[key] = e.target.value;
  }

  @action
  setAreas(areas) {
    this.areas = areas;
  }

  @action
  setAttestation(rewardId) {
    this.blueprint.rewardId = rewardId;
    this.blueprint.rewardType = 'ATTESTATION';
  }

  @action
  setDurationOption(durationOption) {
    this.blueprint.durationSpan = durationOption;
  }

  get cappedTubesRequirementsErrors() {
    const errors = [];

    if (this.usesAllTargetProfilesForCriteria && !this.schemaThreshold) {
      errors.push(this.intl.t('components.combined-course-blueprints.reward-requirements.errors.threshold-required'));
      return errors;
    } else if (!this.usesCappedTubesSelectionForCriteria) {
      if (this.cappedTubeRequirements?.length === 0) {
        return errors;
      }
    }

    const requirements = this.cappedTubeRequirements;
    if (this.usesCappedTubesSelectionForCriteria) {
      if (this.cappedTubeRequirements?.length < 1) {
        errors.push(this.intl.t('components.combined-course-blueprints.reward-requirements.errors.tubes-required'));
      }

      for (const requirement of requirements) {
        if (!requirement.threshold) {
          errors.push(
            this.intl.t('components.combined-course-blueprints.reward-requirements.errors.threshold-required'),
          );
        }

        if (!requirement.tubes || requirement.tubes.length < 1) {
          errors.push(this.intl.t('components.combined-course-blueprints.reward-requirements.errors.tubes-required'));
        }
      }
    }

    return errors;
  }

  @action
  onCappedTubesThresholdChange(criterion, e) {
    criterion.threshold = e.target.value;
  }

  @action
  onCappedTubesNameChange(criterion, e) {
    criterion.name = e.target.value;
  }

  @action
  onCappedTubesSelectionChange(criterion, selection) {
    criterion.tubes = selection.map(({ id, level }) => ({ tubeId: id, level }));
  }

  @action
  removeCappedTubeCriterion(index) {
    const updatedCappedTubeRequirements = [...this.cappedTubeRequirements];
    updatedCappedTubeRequirements.splice(index, 1);
    this.cappedTubeRequirements = updatedCappedTubeRequirements;
  }

  @action
  goToListPage() {
    this.router.transitionTo('authenticated.combined-course-blueprints.list');
  }

  @action
  addCappedTubeSubset() {
    this.cappedTubeRequirements = [...this.cappedTubeRequirements, {}];
  }

  @action
  toggleCriteriaSelectionMode(e) {
    this.usesCappedTubesSelectionForCriteria = e.target.value === 'use-tubes-selection';
    this.usesAllTargetProfilesForCriteria = e.target.value === 'use-all-tubes';
  }

  @action
  setSchemaThreshold(e) {
    this.schemaThreshold = e.target.value;
  }

  get blueprintHasTargetProfiles() {
    return this.blueprint.content.filter((item) => item.type === 'campaign').length > 0;
  }

  <template>
    <form class="combined-course-blueprint-form">
      <h1 class="combined-course-blueprint-form__title">
        {{if
          @updateMode
          (t "components.combined-course-blueprints.update.title")
          (t "components.combined-course-blueprints.create.title")
        }}</h1>

      <GeneralInfoSection
        @blueprint={{this.blueprint}}
        @setData={{this.setData}}
        @setDurationOption={{this.setDurationOption}}
        @updateMode={{@updateMode}}
        @model={{@model}}
      />

      {{#unless @updateMode}}
        <ContentSection @blueprint={{this.blueprint}} @onAreasChange={{this.setAreas}} />
      {{/unless}}

      <RewardRequirementsSection
        @model={{@model}}
        @blueprint={{this.blueprint}}
        @setAttestation={{this.setAttestation}}
        @setData={{this.setData}}
        @updateMode={{@updateMode}}
        @areas={{this.areas}}
        @onCappedTubesThresholdChange={{this.onCappedTubesThresholdChange}}
        @onCappedTubesNameChange={{this.onCappedTubesNameChange}}
        @onCappedTubesSelectionChange={{this.onCappedTubesSelectionChange}}
        @removeCappedTubeCriterion={{this.removeCappedTubeCriterion}}
        @cappedTubeRequirements={{this.cappedTubeRequirements}}
        @addCappedTubeSubset={{this.addCappedTubeSubset}}
        @usesCappedTubesSelectionForCriteria={{this.usesCappedTubesSelectionForCriteria}}
        @usesAllTargetProfilesForCriteria={{this.usesAllTargetProfilesForCriteria}}
        @toggleCriteriaSelectionMode={{this.toggleCriteriaSelectionMode}}
        @schemaThreshold={{this.schemaThreshold}}
        @setSchemaThreshold={{this.setSchemaThreshold}}
        @blueprintHasTargetProfiles={{this.blueprintHasTargetProfiles}}
      />

      <fieldset class="controls">
        <PixButton
          class="combined-course-blueprint-form__button"
          @triggerAction={{this.goToListPage}}
          @variant="secondary"
        >{{t "common.actions.cancel"}}</PixButton>
        <PixButton class="combined-course-blueprint-form__button" @triggerAction={{this.save}} @variant="success">{{if
            @updateMode
            (t "components.combined-course-blueprints.update.updateButton")
            (t "components.combined-course-blueprints.create.createButton")
          }}</PixButton>
      </fieldset>
    </form>
  </template>
}

const GeneralInfoSection = <template>
  <Card
    class="combined-course-blueprint-form__card"
    @title={{t "components.combined-course-blueprints.create.generalInfoCardTitle"}}
  >
    <PixInput
      @id="internalName"
      @value={{@blueprint.internalName}}
      @requiredLabel={{t "common.forms.mandatory"}}
      {{on "change" (fn @setData "internalName")}}
    >
      <:label>
        {{t "components.combined-course-blueprints.labels.internal-name"}}
      </:label>
    </PixInput>

    <PixInput
      @id="name"
      @value={{@blueprint.name}}
      @requiredLabel={{t "common.forms.mandatory"}}
      {{on "change" (fn @setData "name")}}
      @subLabel="Ce titre sera visible par les utilisateurs"
    >
      <:label>
        {{t "components.combined-course-blueprints.labels.name"}}
      </:label>
    </PixInput>

    <PixInput @id="illustration" @value={{@blueprint.illustration}} {{on "change" (fn @setData "illustration")}}>
      <:label>
        {{t "components.combined-course-blueprints.labels.illustration"}}

      </:label>
    </PixInput>

    <PixTextarea
      @id="description"
      @value={{@blueprint.description}}
      @requiredLabel={{t "common.forms.mandatory"}}
      {{on "change" (fn @setData "description")}}
      rows="10"
      @subLabel={{t "components.combined-course-blueprints.labels.description-sublabel"}}
    >
      <:label>
        {{t "components.combined-course-blueprints.labels.description"}}
      </:label>
    </PixTextarea>

    <PixTextarea
      @id="prescriber-description"
      @value={{@blueprint.prescriberDescription}}
      @requiredLabel={{t "common.forms.mandatory"}}
      {{on "change" (fn @setData "prescriberDescription")}}
      rows="10"
      @subLabel={{t "components.combined-course-blueprints.labels.prescriber-description-sublabel"}}
    >
      <:label>
        {{t "components.combined-course-blueprints.labels.prescriber-description"}}
      </:label>
    </PixTextarea>

    {{#if @blueprint.durationOptions}}
      <PixSelect
        size="small"
        @options={{@blueprint.durationOptions}}
        @value={{@blueprint.durationSpan}}
        @onChange={{@setDurationOption}}
        @texts={{hash placeholder=(t "components.combined-course-blueprints.combined-course-duration.placeholder")}}
      >
        <:label>
          {{t "components.combined-course-blueprints.combined-course-duration.label"}}
        </:label>
      </PixSelect>
    {{/if}}

    <PixInput @id="surveyLink" @value={{@blueprint.surveyLink}} {{on "change" (fn @setData "surveyLink")}} rows="10">
      <:label>
        {{t "components.combined-course-blueprints.labels.survey-link"}}
      </:label>
    </PixInput>

  </Card>
</template>;

const RewardRequirementsSection = <template>
  <Card
    class="combined-course-blueprint-form__card"
    @title={{t "components.combined-course-blueprints.create.attestations"}}
  >
    {{#unless @updateMode}}
      <SelectAttestation
        @attestations={{@model.attestations}}
        @value={{@blueprint.rewardId}}
        @onChange={{@setAttestation}}
      />
    {{/unless}}
    {{#if (or (and (not @updateMode) @blueprint.rewardId) (and @updateMode @blueprint.attestationLabel))}}
      <PixTextarea
        @id="reward-requirements"
        @value={{@blueprint.rewardRequirementsDescription}}
        {{on "change" (fn @setData "rewardRequirementsDescription")}}
        rows="10"
      >
        <:label>
          {{t "components.combined-course-blueprints.labels.reward-requirements.description"}}
        </:label>
      </PixTextarea>
      {{#unless @updateMode}}
        {{#if @blueprintHasTargetProfiles}}
          <fieldset class="badge-form-criteria-choice">
            <p>{{t "components.combined-course-blueprints.labels.reward-requirements.reward-criteria-choice"}}</p>

            <PixRadioButton
              name="subsetNumberChoice"
              @checked={{@usesAllTargetProfilesForCriteria}}
              @value="use-all-tubes"
              {{on "change" @toggleCriteriaSelectionMode}}
            >
              <:label>{{t
                  "components.combined-course-blueprints.labels.reward-requirements.entire-blueprint-criteria-option"
                }}</:label>
            </PixRadioButton>

            <PixRadioButton
              name="subsetNumberChoice"
              @checked={{@usesCappedTubesSelectionForCriteria}}
              @value="use-tubes-selection"
              {{on "change" @toggleCriteriaSelectionMode}}
            >
              <:label>{{t
                  "components.combined-course-blueprints.labels.reward-requirements.capped-tubes-selection-option"
                }}</:label>
            </PixRadioButton>

            <PixRadioButton
              name="subsetNumberChoice"
              checked={{if
                (and (not @usesAllTargetProfilesForCriteria) (not @usesCappedTubesSelectionForCriteria))
                "checked"
              }}
              @value="no-criteria"
              {{on "change" @toggleCriteriaSelectionMode}}
            >
              <:label>{{t
                  "components.combined-course-blueprints.labels.reward-requirements.no-criteria-option"
                }}</:label>
            </PixRadioButton>
          </fieldset>

          {{#if @usesCappedTubesSelectionForCriteria}}
            {{#each @cappedTubeRequirements as |criterion index|}}
              <CappedTubesCriterion
                @id={{concat "cappedTubeCriterion" index}}
                @title={{t "components.combined-course-blueprints.labels.reward-requirements.capped-tubes-criteria"}}
                @areas={{@areas}}
                @onThresholdChange={{fn @onCappedTubesThresholdChange criterion}}
                @onNameChange={{fn @onCappedTubesNameChange criterion}}
                @onTubesSelectionChange={{fn @onCappedTubesSelectionChange criterion}}
                @remove={{fn @removeCappedTubeCriterion index}}
                @displayExpandAllButtons={{true}}
              />
            {{/each}}
            <PixButton
              class="badge-form-criterion__add"
              @variant="primary"
              @size="small"
              @triggerAction={{@addCappedTubeSubset}}
              @iconBefore="add"
            >
              {{t "components.combined-course-blueprints.labels.reward-requirements.add-new-tubes-selection"}}
            </PixButton>
          {{else if @usesAllTargetProfilesForCriteria}}
            <CampaignCriterion
              @onThresholdChange={{@setSchemaThreshold}}
              @title={{t "components.combined-course-blueprints.labels.reward-requirements.entire-blueprint-criteria"}}
            />
          {{/if}}
        {{/if}}

      {{/unless}}
    {{/if}}
  </Card>
</template>;
