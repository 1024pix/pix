import difference from 'lodash/difference';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

const LEVEL_COLUMN_NAME = 'Niveau';
const THRESHOLD_COLUMN_NAME = 'Seuil';

export default class Stages extends Component {
  @service store;
  @service notifications;

  @tracked
  firstStageType = undefined;

  get setFirstStage() {
    return (
      (this.isLevelType && this.availableLevels.includes(0)) ||
      (!this.isLevelType && !this.unavailableThresholds.includes(0))
    );
  }

  get availableLevels() {
    const unavailableLevels = this.args.stageCollection
      .get('stages')
      .map((stage) => (stage.isBeingCreated ? null : stage.level));
    const allLevels = Array.from({ length: this.args.maxLevel + 1 }, (_, i) => i);
    return difference(allLevels, unavailableLevels);
  }

  get unavailableThresholds() {
    return this.args.stageCollection.stages.map((stage) => (stage.isBeingCreated ? null : stage.threshold));
  }

  get isLevelType() {
    return this.args.stageCollection.isLevelType;
  }

  get hasStages() {
    const stages = this.args.stageCollection.stages;
    return stages && stages.length > 0;
  }

  get hasNewStage() {
    return this.args.stageCollection.stages.any((stage) => stage.isBeingCreated);
  }

  get newStages() {
    return this.args.stageCollection.stages.filter((stage) => stage.isBeingCreated);
  }

  get displayNoZeroStage() {
    if (!this.hasStages) return false;
    if (this.isLevelType) {
      return !this.args.stageCollection.stages.any((stage) => stage.level === 0);
    }
    return !this.args.stageCollection.stages.any((stage) => stage.threshold === 0);
  }

  get columnNameByStageType() {
    return this.isLevelType ? LEVEL_COLUMN_NAME : THRESHOLD_COLUMN_NAME;
  }

  get hasAvailableStages() {
    const allNewStages = this.args.stageCollection.stages.filter((stage) => stage.isBeingCreated) || [];

    return (this.isLevelType && this.availableLevels.length > allNewStages.length) || !this.isLevelType;
  }

  get mustChooseStageType() {
    return !this.hasStages;
  }

  get collectionHasNonZeroStages() {
    const nonZeroStages = this.args.stageCollection.stages.filter(
      (stage) => !stage.isBeingCreated && stage.threshold !== 0 && stage.level !== 0
    );
    return nonZeroStages.length > 0;
  }

  @action
  addStage() {
    const isFirstStage = this.args.stageCollection.stages.length === 0;
    const nextLowestLevelAvailable = this.isLevelType ? this.availableLevels?.[0] : undefined;
    const stage = this.store.createRecord('stage', {
      level: this.isLevelType ? nextLowestLevelAvailable.toString() : undefined,
      threshold: !this.isLevelType && this.setFirstStage ? '0' : undefined,
      title: isFirstStage ? 'Parcours terminé !' : null,
      message: isFirstStage
        ? 'Vous n’êtes visiblement pas tombé sur vos sujets préférés...Ou peut-être avez-vous besoin d’aide ? Dans tous les cas, rien n’est perdu d’avance ! Avec de l’accompagnement et un peu d’entraînement vous développerez à coup sûr vos compétences numériques !'
        : null,
    });
    this.args.stageCollection.stages.pushObject(stage);
  }

  @action
  onStageTypeChange(event) {
    this.firstStageType = event.target.value;
  }

  get isStageTypeLevelChecked() {
    return this.firstStageType === 'level';
  }

  get isStageTypeThresholdChecked() {
    return this.firstStageType === 'threshold';
  }

  get isAddStageDisabled() {
    return (this.mustChooseStageType && this.firstStageType == null) || !this.hasAvailableStages;
  }

  @action
  async createStages(event) {
    event.preventDefault();

    try {
      await this.args.stageCollection.save({ adapterOptions: { stages: this.args.stageCollection.stages } });
      await this.args.targetProfile.reload();
      this.store
        .peekAll('stage')
        .filter(({ id }) => !id)
        .forEach((stage) => {
          this.args.stageCollection.stages.removeObject(stage);
          stage.deleteRecord();
        });
      this.notifications.success('Palier(s) ajouté(s) avec succès.');
    } catch (e) {
      console.log(e);
      this.notifications.error(e.errors?.[0]?.detail ?? 'Une erreur est survenue.');
    }
  }

  @action
  removeStage(stage) {
    stage.deleteRecord();
  }

  @action
  async deleteStage(stage) {
    this.args.stageCollection.stages.removeObject(stage);
    stage.deleteRecord();
    await this.args.stageCollection.save({ adapterOptions: { stages: this.args.stageCollection.stages } });
  }

  @action
  cancelStagesCreation() {
    this.newStages.forEach((stage) => stage.deleteRecord());
  }

  @action
  onStageLevelChange(stage, level) {
    stage.level = level;
  }
}
