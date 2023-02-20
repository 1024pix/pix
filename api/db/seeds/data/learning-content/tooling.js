import _ from 'lodash';
import bluebird from 'bluebird';
import skillRepository from '../../../../lib/infrastructure/repositories/skill-repository';
import competenceRepository from '../../../../lib/infrastructure/repositories/competence-repository';

const tubeIdsByFramework = {};
let frameworkNames;
let learningContentCached = false;

async function createTargetProfile({
  databaseBuilder,
  targetProfileId,
  name,
  isPublic,
  ownerOrganizationId,
  isSimplifiedAccess,
  description,
  configTargetProfile,
}) {
  await _cacheLearningContent();
  _createTargetProfile({ databaseBuilder, targetProfileId, name, isPublic, ownerOrganizationId, isSimplifiedAccess, description });
  const cappedTubesDTO = _createTargetProfileTubes({ databaseBuilder, targetProfileId, configTargetProfile });
  return {
    targetProfileId,
    cappedTubesDTO,
  };
}

function createBadge({
  databaseBuilder,
  badgeId,
  targetProfileId,
  cappedTubesDTO,
  altMessage,
  imageUrl,
  message,
  title,
  key,
  isCertifiable,
  isAlwaysVisible,
  configBadge,
}) {
  _createBadge({ databaseBuilder, badgeId, targetProfileId, altMessage, imageUrl, message, title, key, isCertifiable, isAlwaysVisible });
  _createBadgeCriteria({ databaseBuilder, badgeId, configBadge, cappedTubesDTO });
}

function createStages({
  databaseBuilder,
  targetProfileId,
  cappedTubesDTO,
  type, // 'LEVEL' or 'THRESHOLD'
  countStages,
}) {
  const values = [0];
  if (type === 'LEVEL') {
    const maxLevel = _.maxBy(cappedTubesDTO, 'level').level;
    const possibleLevels = Array.from({ length: maxLevel }, (_, i) => i + 1);
    const pickedLevels = _pickRandomAmong(possibleLevels, countStages - 1);
    values.push(...pickedLevels);
  }
  if (type === 'THRESHOLD') {
    const possibleThresholds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const pickedThresholds = _pickRandomAmong(possibleThresholds, countStages - 1);
    values.push(...pickedThresholds);
  }
  for (const value of values) {
    _createStage({ databaseBuilder, targetProfileId, type, value });
  }
}

async function _cacheLearningContent() {
  if (!learningContentCached) {
    learningContentCached = true;
    const allCompetences = await competenceRepository.list();
    await bluebird.mapSeries(allCompetences, async (competence) => {
      if (!tubeIdsByFramework[competence.origin]) tubeIdsByFramework[competence.origin] = [];
      const skillsForCompetence = await skillRepository.findActiveByCompetenceId(competence.id);
      tubeIdsByFramework[competence.origin] = _(skillsForCompetence)
        .flatMap('tubeId')
        .concat(tubeIdsByFramework[competence.origin])
        .uniq()
        .value();
    });
    frameworkNames = Object.keys(tubeIdsByFramework);
  }
}

function _createTargetProfile({ databaseBuilder, targetProfileId, name, isPublic, ownerOrganizationId, isSimplifiedAccess, description }) {
  databaseBuilder.factory.buildTargetProfile({ id: targetProfileId, name, isPublic, ownerOrganizationId, isSimplifiedAccess, description });
}

function _createBadge({ databaseBuilder, badgeId, targetProfileId, altMessage, imageUrl, message, title, key, isCertifiable, isAlwaysVisible }) {
  databaseBuilder.factory.buildBadge({ id: badgeId, targetProfileId, altMessage, imageUrl, message, title, key, isCertifiable, isAlwaysVisible });
}

function _createStage({ databaseBuilder, targetProfileId, type, value }) {
  databaseBuilder.factory.buildStage({
    targetProfileId,
    message: `Palier "${value}" pour ${targetProfileId}`,
    title: `Palier "${value}" pour ${targetProfileId}`,
    level: type === 'LEVEL' ? value : null,
    threshold: type === 'LEVEL' ? null : value,
  });
}

function _createTargetProfileTubes({ databaseBuilder, targetProfileId, configTargetProfile }) {
  const cappedTubesDTO = [];
  for (const framework of configTargetProfile.frameworks) {
    const frameworkName = _getFrameworkName(framework);
    for (let i = 0; i < framework.countTubes; ++i) {
      const tubeId = _pickRandomTube(frameworkName, cappedTubesDTO.map(({ id }) => id));
      if (tubeId) {
        const level = _.random(framework.minLevel, framework.maxLevel);
        cappedTubesDTO.push({
          id: tubeId,
          level,
        });
        databaseBuilder.factory.buildTargetProfileTube({
          targetProfileId,
          tubeId,
          level,
        });
      }
    }
  }
  return cappedTubesDTO;
}

function _createBadgeCriteria({ databaseBuilder, badgeId, configBadge, cappedTubesDTO }) {
  for (const criterion of configBadge.criteria) {
    let cappedTubesForCriterion = [];
    if (criterion.scope === 'CappedTubes') {
      const howManyTubesToPick = Math.max(Math.floor(cappedTubesDTO.length / 3), 1);
      const cappedTubesToPick = _pickRandomAmong(cappedTubesDTO, howManyTubesToPick);
      cappedTubesForCriterion = cappedTubesToPick.map((cappedTube) => {
        return {
          id: cappedTube.id,
          level: _.random(cappedTube.level, 1),
        };
      });
    }
    databaseBuilder.factory.buildBadgeCriterion({
      badgeId,
      scope: criterion.scope,
      threshold: criterion.threshold,
      skillSetIds: [],
      cappedTubes: JSON.stringify(cappedTubesForCriterion),
    });
  }
}

function _getFrameworkName({ chooseCoreFramework }) {
  if (chooseCoreFramework) return 'Pix';
  return _pickOneRandomAmong(frameworkNames);
}

function _pickRandomTube(frameworkName, alreadyPickedTubeIds) {
  let attempt = 0;
  while (attempt < 10) {
    const tubeId = _pickOneRandomAmong(tubeIdsByFramework[frameworkName]);
    if (!alreadyPickedTubeIds.includes(tubeId)) return tubeId;
    ++attempt;
  }
  return null;
}

function _pickOneRandomAmong(collection) {
  const items = _pickRandomAmong(collection, 1);
  return items[0];
}

function _pickRandomAmong(collection, howMuch) {
  const shuffledCollection = _.sortBy(collection, () => _.random(0, 100));
  return _.slice(shuffledCollection, 0, howMuch);
}

export default {
  createTargetProfile,
  createBadge,
  createStages,
};
