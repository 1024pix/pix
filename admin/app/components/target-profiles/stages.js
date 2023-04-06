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
      (this.isTypeLevel && this.availableLevels.includes(0)) ||
      (!this.isTypeLevel && !this.unavailableThresholds.includes(0))
    );
  }

  get availableLevels() {
    const unavailableLevels = this.args.targetProfile.stages.map((stage) => (stage.isNew ? null : stage.level));
    const allLevels = Array.from({ length: this.args.targetProfile.maxLevel + 1 }, (_, i) => i);
    return difference(allLevels, unavailableLevels);
  }

  get unavailableThresholds() {
    return this.args.targetProfile.stages.map((stage) => (stage.isNew ? null : stage.threshold));
  }

  get isTypeLevel() {
    return this.args.targetProfile.stages?.firstObject?.isTypeLevel ?? this.firstStageType == 'level';
  }

  get hasStages() {
    const stages = this.args.targetProfile.stages;
    return stages && stages.length > 0;
  }

  get hasNewStage() {
    return this.args.targetProfile.stages.any((stage) => stage.isNew);
  }

  get newStages() {
    return this.args.targetProfile.stages.filter((stage) => stage.isNew);
  }

  get displayNoZeroStage() {
    if (!this.hasStages) return false;
    if (this.isTypeLevel) {
      return !this.args.targetProfile.stages.any((stage) => stage.level === 0);
    }
    return !this.args.targetProfile.stages.any((stage) => stage.threshold === 0);
  }

  get columnNameByStageType() {
    return this.isTypeLevel ? LEVEL_COLUMN_NAME : THRESHOLD_COLUMN_NAME;
  }

  get hasAvailableStages() {
    const allNewStages = this.args.targetProfile.stages.filter((stage) => stage.isNew) || [];

    return (this.isTypeLevel && this.availableLevels.length > allNewStages.length) || !this.isTypeLevel;
  }

  get mustChooseStageStype() {
    return !this.hasStages && this.args.targetProfile.isNewFormat;
  }

  @action
  addStage() {
    const isFirstStage = this.args.targetProfile.stages.length === 0;
    const nextLowestLevelAvailable = this.isTypeLevel ? this.availableLevels?.[0] : undefined;
    this.store.createRecord('stage', {
      targetProfile: this.args.targetProfile,
      level: this.isTypeLevel ? nextLowestLevelAvailable.toString() : undefined,
      threshold: !this.isTypeLevel && this.setFirstStage ? '0' : undefined,
      title: isFirstStage ? 'Parcours terminé !' : null,
      message: isFirstStage
        ? 'Vous n’êtes visiblement pas tombé sur vos sujets préférés...Ou peut-être avez-vous besoin d’aide ? Dans tous les cas, rien n’est perdu d’avance ! Avec de l’accompagnement et un peu d’entraînement vous développerez à coup sûr vos compétences numériques !'
        : null,
    });
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
    return (this.mustChooseStageStype && this.firstStageType == null) || !this.hasAvailableStages;
  }

  @action
  async createStages(event) {
    event.preventDefault();

    try {
      for (const stage of this.newStages) {
        await stage.save();
      }
      await this.args.targetProfile.stages.reload();
      this.notifications.success('Palier(s) ajouté(s) avec succès.');
    } catch (e) {
      this.notifications.error(e.errors?.[0]?.detail ?? 'Une erreur est survenue.');
    }
  }

  @action
  removeStage(stage) {
    stage.deleteRecord();
  }

  @action
  deleteStage(stage) {
    stage.destroyRecord();
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
