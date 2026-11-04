import { PixButton, PixInput, PixSelect, PixTextarea } from '@1024pix/nebulix-ember';
import { fn, hash } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import Card from '../card';
import ContentSection from './form/content-section';
import RewardRequirementsSection from './form/reward-requirements-section';

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
  setRewardRequirements({
    cappedTubeRequirements,
    usesCappedTubesSelectionForCriteria,
    usesAllTargetProfilesForCriteria,
    schemaThreshold,
  }) {
    this.cappedTubeRequirements = cappedTubeRequirements;
    this.usesCappedTubesSelectionForCriteria = usesCappedTubesSelectionForCriteria;
    this.usesAllTargetProfilesForCriteria = usesAllTargetProfilesForCriteria;
    this.schemaThreshold = schemaThreshold;
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
  goToListPage() {
    this.router.transitionTo('authenticated.combined-course-blueprints.list');
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
        @areas={{this.areas}}
        @updateMode={{@updateMode}}
        @onRewardRequirementsChange={{this.setRewardRequirements}}
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
