import { PixButton } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import ContentSection from './content-section';
import GeneralInfoSection from './general-info-section';
import RewardRequirementsSection from './reward-requirements-section';

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

      <GeneralInfoSection @blueprint={{this.blueprint}} />

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
