const _ = require('lodash');
const bluebird = require('bluebird');
const skillRepository = require('../../../../lib/infrastructure/repositories/skill-repository');
const competenceRepository = require('../../../../lib/infrastructure/repositories/competence-repository');

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
  config, // { framework[{ chooseCoreFramework: true/false, countTubes: 10, minLevel: 1, maxLevel: 5 }]
}) {
  await _cacheLearningContent();
  _createTargetProfile({ databaseBuilder, targetProfileId, name, isPublic, ownerOrganizationId, isSimplifiedAccess, description });
  _createTargetProfileTubes({ databaseBuilder, targetProfileId, config });
  return targetProfileId;
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

function _createTargetProfileTubes({ databaseBuilder, targetProfileId, config }) {
  const cappedTubesDTO = [];
  for (const framework of config.frameworks) {
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

function _getFrameworkName({ chooseCoreFramework }) {
  if (chooseCoreFramework) return 'Pix';
  return _pickRandomAmong(frameworkNames, 1);
}

function _pickRandomTube(frameworkName, alreadyPickedTubeIds) {
  let attempt = 0;
  while (attempt < 10) {
    const tubeId = _pickRandomAmong(tubeIdsByFramework[frameworkName], 1);
    if (!alreadyPickedTubeIds.includes(tubeId)) return tubeId;
    ++attempt;
  }
  return null;
}

function _pickRandomAmong(collection, howMuch) {
  const shuffledCollection = _.sortBy(collection, () => _.random(0, 100));
  if (howMuch === 1) return shuffledCollection[0];
  return _.slice(shuffledCollection, 0, howMuch);
}

module.exports = {
  createTargetProfile,
};
