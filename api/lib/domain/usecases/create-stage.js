const { InvalidStageError } = require('../errors');

module.exports = async function createStage({
  stage,
  stageRepository,
  targetProfileRepository,
  targetProfileForAdminRepository,
}) {
  const { targetProfileId } = stage;

  if ((stage.level == null && stage.threshold == null) || (stage.level != null && stage.threshold != null)) {
    throw new InvalidStageError('seuil ou niveau obligatoire');
  }

  if (stage.level != null) {
    if (!(await targetProfileForAdminRepository.isNewFormat(targetProfileId))) {
      throw new InvalidStageError('niveau interdit sur un profil cible par acquis');
    }

    const targetProfile = await targetProfileForAdminRepository.getAsNewFormat({ id: targetProfileId });

    _checkMaxLevel(stage, targetProfile);
  }

  const existingStages = await targetProfileRepository.findStages({ targetProfileId });

  if (existingStages.length !== 0) {
    const isTypeLevel = existingStages[0].level != null;

    _checkValidType(stage, isTypeLevel);
    _checkDuplicateValue(stage, isTypeLevel, existingStages);
  }

  return stageRepository.create(stage);
};

function _checkValidType(stage, isTypeLevel) {
  if (isTypeLevel && stage.level == null) {
    throw new InvalidStageError('niveau obligatoire');
  }
  if (!isTypeLevel && stage.threshold == null) {
    throw new InvalidStageError('seuil obligatoire');
  }
}

function _checkDuplicateValue(stage, isTypeLevel, existingStages) {
  if (isTypeLevel && existingStages.some(({ level }) => level === stage.level)) {
    throw new InvalidStageError('niveau déjà utilisé');
  }
  if (!isTypeLevel && existingStages.some(({ threshold }) => threshold === stage.threshold)) {
    throw new InvalidStageError('seuil déjà utilisé');
  }
}

function _checkMaxLevel(stage, targetProfile) {
  if (stage.level > targetProfile.maxLevel) {
    throw new InvalidStageError('niveau supérieur au maximum');
  }
}
