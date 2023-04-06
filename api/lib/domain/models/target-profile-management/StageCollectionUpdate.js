const _ = require('lodash');
const { InvalidStageError } = require('../../errors.js');

class StageCollectionUpdate {
  constructor({ stagesDTO, stageCollection }) {
    this._stagesDTO = stagesDTO;
    this._stageCollection = stageCollection;

    _checkValidity(stagesDTO, stageCollection);
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
  // 1 palier zero
  const hasZeroStage = stagesDTO.find(({ threshold, level }) => threshold === 0 || level === 0);
  if (!hasZeroStage) {
    throw new InvalidStageError('La présence du palier zéro est obligatoire.');
  }

  // ou TOUT threshold ou TOUT level
  const thresholds = stagesDTO.filter(({ threshold }) => !_.isNil(threshold));
  const levels = stagesDTO.filter(({ level }) => !_.isNil(level));

  if (thresholds.length !== 0 && levels.length !== 0) {
    throw new InvalidStageError('Les paliers doivent être tous en niveau ou seuil.');
  }

  // valeurs occupées qu'une seule fois
  const uniqValue = new Set(stagesDTO.map(({ level, threshold }) => level || threshold));
  if (uniqValue.size !== stagesDTO.length) {
    throw new InvalidStageError('Les valeurs de seuil/niveau doivent être uniques.');
  }

  // titre et message obligatoires !
  if (stagesDTO.find(({ title, message }) => _.isEmpty(title) || _.isEmpty(message))) {
    throw new InvalidStageError("Le titre et le message d'un palier sont obligatoires.");
  }

  // si paliers par niveau, le niveau ne doit pas excéder le niveau max du profil cible
  // on peut trouver le niveau max du PC dans stageCollection.maxLevel
  if (levels.length > 0 && Math.max(...levels.map(({ level }) => level)) > stageCollection.maxLevel) {
    throw new InvalidStageError("Le niveau d'un palier dépasse le niveau maximum du profil cible.");
  }

  const currentStageIds = stageCollection.stages.map(({ id }) => id);
  const difference = stagesDTO.filter(({ id }) => !_.isNil(id) && !currentStageIds.includes(parseInt(id)));
  if (difference.length > 0) {
    throw new InvalidStageError(
      "La modification de paliers n'est autorisé que pour les paliers appartenant au profil cible."
    );
  }
}

module.exports = StageCollectionUpdate;
