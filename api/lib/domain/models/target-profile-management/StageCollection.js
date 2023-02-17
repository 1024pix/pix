const _ = require('lodash');
const { InvalidStageError } = require('../../errors');

class StageCollection {
  constructor({ id, stages, maxLevel }) {
    this._id = id;
    this._maxLevel = maxLevel;
    this._stages = [];
    this._canAddStageTypeOfLevel = true;

    stages.forEach((stage, index) => {
      this._stages.push({
        id: stage.id,
        targetProfileId: id,
        level: stage.level,
        threshold: stage.threshold,
        title: stage.title,
        message: stage.message,
        prescriberTitle: stage.prescriberTitle,
        prescriberDescription: stage.prescriberDescription,
      });

      if (index === 0) this._canAddStageTypeOfLevel = stage.level !== null;
    });
  }

  get stages() {
    return this._stages;
  }

  get id() {
    return this._id;
  }

  addStage(stage) {
    this._checkStageValidity(stage);

    this._stages.push({
      id: undefined,
      targetProfileId: this._id,
      level: stage.level,
      threshold: stage.threshold,
      title: stage.title,
      message: stage.message,
      prescriberTitle: null,
      prescriberDescription: null,
    });
  }

  updateStage(stage) {
    const [oldStage] = _.remove(this._stages, (oldStage) => oldStage.id === stage.id);
    if (!oldStage) {
      throw new InvalidStageError(`Le palier ${stage.id} n'appartient pas à ce profil cible.`);
    }
    this._checkStageValidity(stage);

    this._stages.push({
      id: stage.id,
      targetProfileId: this._id,
      level: stage.level,
      threshold: stage.threshold,
      title: stage.title,
      message: stage.message,
      prescriberTitle: stage.prescriberTitle,
      prescriberDescription: stage.prescriberDescription,
    });
  }

  _checkStageValidity(stage) {
    this._hasDefinedThresholdOrLevel(stage);

    if (this._stages.length > 0 || stage.id) {
      if (this._canAddStageTypeOfLevel) {
        if (!stage.level && stage.level !== 0) {
          throw new InvalidStageError('Niveau obligatoire.');
        }

        if (this._hasLevel(stage.level)) {
          throw new InvalidStageError('Niveau déjà utilisé.');
        }
      }
      if (!this._canAddStageTypeOfLevel) {
        if (!stage.threshold && stage.threshold !== 0) {
          throw new InvalidStageError('Seuil obligatoire.');
        }
        if (this._hasThreshold(stage.threshold)) {
          throw new InvalidStageError('Seuil déjà utilisé.');
        }
      }
    }

    if (stage.level != null) {
      if (!_.isInteger(stage.level) || stage.level > this._maxLevel || stage.level < 0) {
        throw new InvalidStageError(`Niveau doit être compris entre 0 et ${this._maxLevel}.`);
      }
    } else {
      if (!_.isInteger(stage.threshold) || stage.threshold > 100 || stage.threshold < 0) {
        throw new InvalidStageError('Seuil doit être compris entre 0 et 100.');
      }
    }
    if (_.isEmpty(stage.title)) throw new InvalidStageError('Titre obligatoire.');
    if (_.isEmpty(stage.message)) throw new InvalidStageError('Message obligatoire.');
  }

  _hasLevel(level) {
    return this._stages.find((stage) => stage.level === level);
  }

  _isTypeThreshold() {
    return this._stages.length > 0 ? this._stages[0].threshold : false;
  }

  _hasThreshold(threshold) {
    return this._stages.find((stage) => stage.threshold === threshold);
  }

  _hasDefinedThresholdOrLevel(stage) {
    if ((stage.level == null && stage.threshold == null) || (stage.level != null && stage.threshold != null)) {
      throw new InvalidStageError('Seuil ou niveau obligatoire.');
    }
  }
}

module.exports = StageCollection;
