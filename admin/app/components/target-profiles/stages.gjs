import { PixButton, PixRadioButton, PixTooltip } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import difference from 'lodash/difference';

import NewStage from './stages/new-stage';
import Stage from './stages/stage';

const LEVEL_COLUMN_NAME = 'Niveau';
const THRESHOLD_COLUMN_NAME = 'Seuil';

export default class Stages extends Component {
  @service store;
  @service intl;
  @service pixToast;

  @tracked stageType = undefined;
  @tracked stages = [];

  constructor() {
    super(...arguments);
    this.args.stageCollection.stages.then((stages) => {
      this.stages = stages;
    });
  }

  get sortedStages() {
    const currentStages = this.stages.filter((stage) => !stage.isBeingCreated);
    const newStages = this.stages.filter((stage) => stage.isBeingCreated);
    return [
      ...currentStages.sort((stageA, stageB) => {
        let stageAValue, stageBValue;
        if (this.isLevelType) {
          stageAValue = stageA.isFirstSkill ? 0.5 : stageA.level;
          stageBValue = stageB.isFirstSkill ? 0.5 : stageB.level;
        } else {
          stageAValue = stageA.isFirstSkill ? 0.5 : stageA.threshold;
          stageBValue = stageB.isFirstSkill ? 0.5 : stageB.threshold;
        }
        return stageAValue - stageBValue;
      }),
      ...newStages,
    ];
  }

  get hasStages() {
    return this.stages.length > 0;
  }

  get hasAvailableStages() {
    const allNewStages = this.stages.filter((stage) => stage.isBeingCreated) || [];

    return (this.isLevelType && this.availableLevels.length > allNewStages.length) || !this.isLevelType;
  }

  get hasNewStage() {
    return this.stages.some((stage) => stage.isBeingCreated);
  }

  get newStages() {
    return this.stages.filter((stage) => stage.isBeingCreated);
  }

  get canAddNewStage() {
    return !this.args.hasLinkedCampaign;
  }

  get availableLevels() {
    const unavailableLevels = this.stages.filter((stage) => !stage.isBeingCreated).map((stage) => stage.level);
    const allLevels = Array.from({ length: this.args.maxLevel + 1 }, (_, i) => i);
    return difference(allLevels, unavailableLevels);
  }

  get unavailableThresholds() {
    return this.stages.map((stage) => (stage.isBeingCreated ? null : stage.threshold));
  }

  get isLevelType() {
    const zeroStage = this.stages.find((stage) => stage.isZeroStage);
    return Boolean(zeroStage?.isTypeLevel);
  }

  get columnNameByStageType() {
    return this.isLevelType ? LEVEL_COLUMN_NAME : THRESHOLD_COLUMN_NAME;
  }

  get mustChooseStageType() {
    return !this.hasStages;
  }

  get collectionHasNonZeroStages() {
    const nonZeroStages = this.stages.filter(
      (stage) => !stage.isBeingCreated && stage.threshold !== 0 && stage.level !== 0,
    );
    return nonZeroStages.length > 0;
  }

  get isAddFirstSkillStageDisabled() {
    return this.stages.some((stage) => stage.isFirstSkill);
  }

  get isStageTypeLevelChecked() {
    return this.stageType === 'level';
  }

  get isStageTypeThresholdChecked() {
    return this.stageType === 'threshold';
  }

  get isAddStageDisabled() {
    return (this.mustChooseStageType && this.stageType == null) || !this.hasAvailableStages;
  }

  @action
  addFirstSkillStage() {
    const stage = this.store.createRecord('stage', {
      level: null,
      threshold: null,
      isFirstSkill: true,
      title: null,
      message: null,
    });
    this.stages = [...this.stages, stage];
  }

  @action
  addStage() {
    const shouldAddZeroStage = this.stages.length === 0;
    let stage;
    if (shouldAddZeroStage) {
      stage = this.store.createRecord('stage', {
        level: this.stageType === 'level' ? 0 : null,
        threshold: this.stageType === 'level' ? null : 0,
        isFirstSkill: false,
        title: 'Parcours terminé !',
        message:
          'Vous n’êtes visiblement pas tombé sur vos sujets préférés...Ou peut-être avez-vous besoin d’aide ? Dans tous les cas, rien n’est perdu d’avance ! Avec de l’accompagnement et un peu d’entraînement vous développerez à coup sûr vos compétences numériques !',
      });
    } else {
      const nextLowestLevelAvailable = this.isLevelType
        ? this.availableLevels?.filter((level) => level !== 0)[0]
        : undefined;
      stage = this.store.createRecord('stage', {
        level: this.isLevelType ? nextLowestLevelAvailable : null,
        isFirstSkill: false,
        threshold: null,
        title: null,
        message: null,
      });
    }
    this.stages = [...this.stages, stage];
  }

  @action
  onStageTypeChange(event) {
    this.stageType = event.target.value;
  }

  @action
  async createStages(event) {
    event.preventDefault();

    try {
      await this.args.stageCollection.save({ adapterOptions: { stages: this.stages } });
      await this.args.targetProfile.reload();
      this.stages = await this.args.stageCollection.stages;
      this.pixToast.sendSuccessNotification({ message: 'Palier(s) ajouté(s) avec succès.' });
    } catch (error) {
      const genericErrorMessage = this.intl.t('common.notifications.generic-error');
      const message = error.errors?.[0]?.detail ?? genericErrorMessage;
      this.pixToast.sendErrorNotification({ message });
    }
  }

  @action
  removeStage(stage) {
    const index = this.stages.indexOf(stage);
    if (index !== -1) {
      this.stages.splice(index, 1);
      this.stages = [...this.stages];
    }
    stage.deleteRecord();
  }

  @action
  async deleteStage(stage) {
    this.removeStage(stage);
    await this.args.stageCollection.save({ adapterOptions: { stages: this.stages } });
  }

  @action
  cancelStagesCreation() {
    for (const stage of this.newStages) {
      this.removeStage(stage);
    }
  }

  @action
  onStageLevelChange(stage, level) {
    stage.level = parseInt(level);
  }

  <template>
    {{! template-lint-disable require-input-label }}
    <div class="content-text content-text--small">
      <form class="form" {{on "submit" this.createStages}}>
        {{#if this.stages}}
          <div class="table-admin">
            <table class="stages-table">
              <thead>
                <tr>
                  <th class="stages-table__type">{{this.columnNameByStageType}}</th>
                  <th class="stages-table__title">Titre</th>
                  <th>Message</th>
                  <th class="stages-table__prescriber-title">Titre prescripteur</th>
                  <th class="stages-table__prescriber-description">Description prescripteur</th>
                  <th class="stages-table__actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {{#each this.sortedStages as |stage index|}}
                  {{#if stage.isBeingCreated}}
                    <NewStage
                      @index={{index}}
                      @stage={{stage}}
                      @imageUrl={{@imageUrl}}
                      @availableLevels={{this.availableLevels}}
                      @unavailableThresholds={{this.unavailableThresholds}}
                      @setLevel={{fn this.onStageLevelChange stage}}
                      @remove={{fn this.removeStage stage}}
                    />
                  {{else}}
                    <Stage
                      @imageUrl={{@imageUrl}}
                      @targetProfileId={{@targetProfileId}}
                      @stage={{stage}}
                      @deleteStage={{this.deleteStage}}
                      @collectionHasNonZeroStages={{this.collectionHasNonZeroStages}}
                      @hasLinkedCampaign={{@hasLinkedCampaign}}
                    />
                  {{/if}}
                {{/each}}
              </tbody>
            </table>
          </div>
        {{else}}
          <div class="table__empty">Aucun palier associé</div>
        {{/if}}
        {{#if this.canAddNewStage}}
          {{#if this.mustChooseStageType}}
            <PixRadioButton
              name="stageType"
              @value="threshold"
              checked={{this.isStageTypeThresholdChecked}}
              {{on "change" this.onStageTypeChange}}
            >
              <:label>Palier par seuil</:label>
            </PixRadioButton>
            <PixRadioButton
              name="stageType"
              @value="level"
              checked={{this.isStageTypeLevelChecked}}
              {{on "change" this.onStageTypeChange}}
            >
              <:label>Palier par niveau</:label>
            </PixRadioButton>
          {{/if}}
          <div class="add-stage-actions">
            <PixButton
              class="stages-new-stage"
              @variant="secondary"
              @triggerAction={{this.addStage}}
              @isDisabled={{this.isAddStageDisabled}}
              @iconBefore="add"
            >
              Nouveau palier
            </PixButton>
            {{#if this.hasStages}}
              <PixTooltip @id="tooltip-stage" @isWide="true">
                <:triggerElement>
                  <PixButton
                    class="stages-new-stage"
                    @variant="secondary"
                    @triggerAction={{this.addFirstSkillStage}}
                    @isDisabled={{this.isAddFirstSkillStageDisabled}}
                    @iconBefore="add"
                  >
                    Nouveau palier "1er acquis"
                  </PixButton>
                </:triggerElement>
                <:tooltip>
                  Le palier 1er acquis est obtenu dès un acquis réussi par le participant. Il se verra alors attribuer
                  une étoile à la fin de son parcours.
                </:tooltip>
              </PixTooltip>
            {{/if}}
          </div>
        {{/if}}
        {{#if this.hasNewStage}}
          <div class="stages-actions form-actions">
            <PixButton @variant="secondary" @triggerAction={{this.cancelStagesCreation}}>
              {{t "common.actions.cancel"}}
            </PixButton>
            <PixButton type="submit" @variant="success" @triggerAction={{this.createStages}}>
              {{t "common.actions.save"}}
            </PixButton>
          </div>
        {{/if}}
      </form>
    </div>
  </template>
}
