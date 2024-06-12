import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import difference from 'lodash/difference';

const LEVEL_COLUMN_NAME = 'Niveau';
const THRESHOLD_COLUMN_NAME = 'Seuil';

export default class Stages extends Component {
  @service store;
  @service notifications;

  @tracked
  stageType = undefined;

  @tracked stages = [];

  constructor() {
    super(...arguments);
    Promise.resolve(this.args.stageCollection.stages).then((stages) => {
      this.stages = stages;
    });
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
    return this.args.stageCollection.isLevelType;
  }

  get hasNewStage() {
    return this.stages.any((stage) => stage.isBeingCreated);
  }

  get newStages() {
    return this.stages.filter((stage) => stage.isBeingCreated);
  }

  get columnNameByStageType() {
    return this.isLevelType ? LEVEL_COLUMN_NAME : THRESHOLD_COLUMN_NAME;
  }

  get hasAvailableStages() {
    const allNewStages = this.stages.filter((stage) => stage.isBeingCreated) || [];

    return (this.isLevelType && this.availableLevels.length > allNewStages.length) || !this.isLevelType;
  }

  get mustChooseStageType() {
    return !this.args.stageCollection.hasStages;
  }

  get collectionHasNonZeroStages() {
    const nonZeroStages = this.stages.filter(
      (stage) => !stage.isBeingCreated && stage.threshold !== 0 && stage.level !== 0,
    );
    return nonZeroStages.length > 0;
  }

  get isAddFirstSkillStageDisabled() {
    return this.stages.find((stage) => stage.isFirstSkill);
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
    this.stages.pushObject(stage);
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
    this.stages.pushObject(stage);
  }

  @action
  onStageTypeChange(event) {
    this.stageType = event.target.value;
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

  get canAddNewStage() {
    return !this.args.hasLinkedCampaign;
  }

  @action
  async createStages(event) {
    event.preventDefault();

    try {
      await this.args.stageCollection.save({ adapterOptions: { stages: this.stages } });
      await this.args.targetProfile.reload();
      this.store
        .peekAll('stage')
        .filter(({ id }) => !id)
        .forEach((stage) => {
          this.stages.removeObject(stage);
          stage.deleteRecord();
        });
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
  async deleteStage(stage) {
    this.stages.removeObject(stage);
    stage.deleteRecord();
    await this.args.stageCollection.save({ adapterOptions: { stages: this.stages } });
  }

  @action
  cancelStagesCreation() {
    this.newStages.forEach((stage) => stage.deleteRecord());
  }

  @action
  onStageLevelChange(stage, level) {
    stage.level = parseInt(level);
  }
}
