import _ from 'lodash';
import { InvalidStageError } from '../../../../../lib/domain/errors.js';

const DEFAULT_VALUE_FIRST_SKILL = -1;

class StageCollectionUpdate {
  constructor({ stagesDTO, stageCollection }) {
    this._stagesDTO = stagesDTO.map((stageDTO) => ({
      id: _.isNil(stageDTO.id) ? null : parseInt(stageDTO.id),
      threshold: _.isNil(stageDTO.threshold) ? null : parseInt(stageDTO.threshold),
      level: _.isNil(stageDTO.level) ? null : parseInt(stageDTO.level),
      isFirstSkill: Boolean(stageDTO.isFirstSkill),
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
  if (stagesDTO.length === 0) return;
  const thresholds = stagesDTO.filter(({ threshold }) => threshold !== null);
  const levels = stagesDTO.filter(({ level }) => level !== null);
  _checkZeroStagePresence(stagesDTO);
  _checkFirstSkillStageValidity(stagesDTO);
  _checkAllStagesHaveValue(stagesDTO);
  _checkAllStageAreOfTheSameType(thresholds, levels);
  _checkAllStagesHaveUniqueValue(stagesDTO);
  _checkAllStagesHaveTitleAndMessage(stagesDTO);
  _checkLevelValues(levels, stageCollection.maxLevel);
  _checkThresholdValues(thresholds);
  _checkTargetProfileIds(stagesDTO, stageCollection);
}

function _checkZeroStagePresence(stagesDTO) {
  const hasZeroStage = stagesDTO.find(({ threshold, level }) => threshold === 0 || level === 0);
  if (!hasZeroStage && stagesDTO.length > 0) {
    throw new InvalidStageError('La présence du palier zéro est obligatoire.');
  }
}

function _checkFirstSkillStageValidity(stagesDTO) {
  const firstSkills = stagesDTO.filter(({ isFirstSkill }) => isFirstSkill);
  if (firstSkills.length > 1) {
    throw new InvalidStageError("Il ne peut y avoir qu'un seul palier premier acquis.");
  }
  if (firstSkills.length === 1 && (firstSkills[0].level !== null || firstSkills[0].threshold !== null)) {
    throw new InvalidStageError('Un palier de premier acquis ne peut pas avoir de niveau ou de seuil.');
  }
}

function _checkAllStagesHaveValue(stagesDTO) {
  const stagesWithoutValue = stagesDTO.filter(
    ({ threshold, level, isFirstSkill }) => threshold === null && level === null && !isFirstSkill,
  );
  if (stagesWithoutValue.length > 0) {
    throw new InvalidStageError('Les paliers doivent avoir une valeur de seuil ou de niveau.');
  }
}

function _checkAllStageAreOfTheSameType(thresholds, levels) {
  if (thresholds.length !== 0 && levels.length !== 0) {
    throw new InvalidStageError('Les paliers doivent être tous en niveau ou seuil.');
  }
}

function _checkAllStagesHaveUniqueValue(stagesDTO) {
  const uniqValues = new Set(
    stagesDTO.map(({ level, threshold, isFirstSkill }) => {
      if (isFirstSkill) {
        return DEFAULT_VALUE_FIRST_SKILL;
      }
      return level === null ? threshold : level;
    }),
  );
  if (uniqValues.size !== stagesDTO.length) {
    throw new InvalidStageError('Les valeurs de seuil/niveau doivent être uniques.');
  }
}

function _checkAllStagesHaveTitleAndMessage(stagesDTO) {
  if (stagesDTO.find(({ title, message }) => title === '' || message === '')) {
    throw new InvalidStageError("Le titre et le message d'un palier sont obligatoires.");
  }
}

function _checkLevelValues(levels, maxLevel) {
  if (levels.length > 0) {
    if (Math.max(...levels.map(({ level }) => level)) > maxLevel) {
      throw new InvalidStageError("Le niveau d'un palier dépasse le niveau maximum du profil cible.");
    }
    if (Math.min(...levels.map(({ level }) => level)) < 0) {
      throw new InvalidStageError("Le niveau d'un palier doit être supérieur à zéro.");
    }
  }
}

function _checkThresholdValues(thresholds) {
  if (thresholds.length > 0) {
    if (Math.max(...thresholds.map(({ threshold }) => threshold)) > 100) {
      throw new InvalidStageError('Le seuil ne doit pas dépasser 100.');
    }
    if (Math.min(...thresholds.map(({ threshold }) => threshold)) < 0) {
      throw new InvalidStageError('Le seuil doit être supérieur à zéro.');
    }
  }
}

function _checkTargetProfileIds(stagesDTO, stageCollection) {
  const currentStageIds = stageCollection.stages.map(({ id }) => id);
  const difference = stagesDTO.filter(({ id }) => id !== null && !currentStageIds.includes(id));
  if (difference.length > 0) {
    throw new InvalidStageError(
      "La modification de paliers n'est autorisé que pour les paliers appartenant au profil cible.",
    );
  }
}

export { StageCollectionUpdate };
