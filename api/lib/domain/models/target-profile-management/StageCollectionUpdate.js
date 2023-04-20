const _ = require('lodash');
const { InvalidStageError } = require('../../errors.js');

class StageCollectionUpdate {
  constructor({ stagesDTO, stageCollection }) {
    this._stagesDTO = stagesDTO.map((stageDTO) => ({
      id: _.isNil(stageDTO.id) ? null : parseInt(stageDTO.id),
      threshold: _.isNil(stageDTO.threshold) ? null : parseInt(stageDTO.threshold),
      level: _.isNil(stageDTO.level) ? null : parseInt(stageDTO.level),
      title: _.isEmpty(stageDTO.title) ? '' : stageDTO.title,
      message: _.isEmpty(stageDTO.message) ? '' : stageDTO.message,
      prescriberTitle: _.isEmpty(stageDTO.prescriberTitle) ? '' : stageDTO.prescriberTitle,
      prescriberDescription: _.isEmpty(stageDTO.prescriberDescription) ? '' : stageDTO.prescriberDescription,
    }));
    this._stageCollection = stageCollection;

    _checkValidity(this._stagesDTO, stageCollection);
  }

  get stageIdsToDelete() {
    return this._stageCollection.stages.filter((stage) => !this._stagesDTO.includes(stage)).map(({ id }) => id);
  }

  get stagesToCreate() {
    return this._stagesDTO
      .filter(({ id }) => id === null)
      .map((stage) => ({
        ...stage,
        targetProfileId: this._stageCollection.id,
      }));
  }

  get stagesToUpdate() {
    return this._stagesDTO
      .filter(({ id }) => id !== null)
      .map((stage) => ({
        ...stage,
        targetProfileId: this._stageCollection.id,
      }));
  }
}

function _checkValidity(stagesDTO, stageCollection) {
  const hasZeroStage = stagesDTO.find(({ threshold, level }) => threshold === 0 || level === 0);
  if (!hasZeroStage) {
    throw new InvalidStageError('La présence du palier zéro est obligatoire.');
  }

  const stagesWithoutValue = stagesDTO.filter(({ threshold, level }) => threshold === null && level === null);
  if (stagesWithoutValue.length > 0) {
    throw new InvalidStageError('Les paliers doivent avoir une valeur de seuil ou de niveau.');
  }

  const thresholds = stagesDTO.filter(({ threshold }) => threshold !== null);
  const levels = stagesDTO.filter(({ level }) => level !== null);

  if (thresholds.length !== 0 && levels.length !== 0) {
    throw new InvalidStageError('Les paliers doivent être tous en niveau ou seuil.');
  }

  const uniqValue = new Set(stagesDTO.map(({ level, threshold }) => level || threshold));
  if (uniqValue.size !== stagesDTO.length) {
    throw new InvalidStageError('Les valeurs de seuil/niveau doivent être uniques.');
  }

  if (stagesDTO.find(({ title, message }) => title === '' || message === '')) {
    throw new InvalidStageError("Le titre et le message d'un palier sont obligatoires.");
  }

  if (levels.length > 0) {
    if (Math.max(...levels.map(({ level }) => level)) > stageCollection.maxLevel) {
      throw new InvalidStageError("Le niveau d'un palier dépasse le niveau maximum du profil cible.");
    }
    if (Math.min(...levels.map(({ level }) => level)) < 0) {
      throw new InvalidStageError("Le niveau d'un palier doit être supérieur à zéro.");
    }
  }

  if (thresholds.length > 0) {
    if (Math.max(...thresholds.map(({ threshold }) => threshold)) > 100) {
      throw new InvalidStageError('Le seuil ne doit pas dépasser 100.');
    }
    if (Math.min(...thresholds.map(({ threshold }) => threshold)) < 0) {
      throw new InvalidStageError('Le seuil doit être supérieur à zéro.');
    }
  }

  const currentStageIds = stageCollection.stages.map(({ id }) => id);
  const difference = stagesDTO.filter(({ id }) => id !== null && !currentStageIds.includes(id));
  if (difference.length > 0) {
    throw new InvalidStageError(
      "La modification de paliers n'est autorisé que pour les paliers appartenant au profil cible."
    );
  }
}

module.exports = StageCollectionUpdate;
