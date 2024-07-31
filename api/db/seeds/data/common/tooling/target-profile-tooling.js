import _ from 'lodash';

import { PromiseUtils } from '../../../../../src/shared/infrastructure/utils/promise-utils.js';
import * as learningContent from './learning-content.js';

export { createBadge, createStages, createTargetProfile };
let frameworkNames;
const tubeIdsByFramework = {};
/**
 * Fonction générique pour créer un profil cible selon une configuration donnée.
 * Retourne l'ID du profil cible ainsi qu'un objet JS contenant les sujets cappés par niveau.
 *
 * @param databaseBuilder{DatabaseBuilder}
 * @param targetProfileId{number}
 * @param name{string}
 * @param category{string}
 * @param isPublic{boolean}
 * @param ownerOrganizationId{number}
 * @param isSimplifiedAccess{boolean}
 * @param description{string}
 * @param comment{string}
 * @param imageUrl{string}
 * @param outdated{boolean}
 * @param attachedOrganizationIds{Array<number>}
 * @param configTargetProfile {frameworks: [
 *       {
 *         chooseCoreFramework: boolean,
 *         countTubes: number,
 *         minLevel: number,
 *         maxLevel: number,
 *       },
 *     ]}
 * @returns {Promise<{cappedTubesDTO: [{
 *           id: number,
 *           level: number,
 *         }], targetProfileId: number}>}
 */
async function createTargetProfile({
  databaseBuilder,
  targetProfileId,
  name,
  category,
  isPublic,
  ownerOrganizationId,
  isSimplifiedAccess,
  description,
  comment,
  imageUrl,
  outdated,
  attachedOrganizationIds = [],
  configTargetProfile,
}) {
  if (!frameworkNames) {
    const allCompetences = await learningContent.getAllCompetences();
    await PromiseUtils.map(
      allCompetences,
      async (competence) => {
        if (!tubeIdsByFramework[competence.origin]) tubeIdsByFramework[competence.origin] = [];
        const skillsForCompetence = await learningContent.findActiveSkillsByCompetenceId(competence.id);
        tubeIdsByFramework[competence.origin] = _(skillsForCompetence)
          .flatMap('tubeId')
          .concat(tubeIdsByFramework[competence.origin])
          .uniq()
          .value();
      },
      { concurrency: 3 },
    );
    frameworkNames = Object.keys(tubeIdsByFramework);
  }
  _createTargetProfile({
    databaseBuilder,
    targetProfileId,
    name,
    category,
    isPublic,
    ownerOrganizationId,
    isSimplifiedAccess,
    description,
    comment,
    imageUrl,
    outdated,
    attachedOrganizationIds,
  });
  const cappedTubesDTO = _createTargetProfileTubes({ databaseBuilder, targetProfileId, configTargetProfile });

  await databaseBuilder.commit();
  return {
    targetProfileId,
    cappedTubesDTO,
  };
}

/**
 * Fonction générique pour créer un RT et ses critères à un profil cible selon une configuration donnée.
 * Retourne l'ID du RT.
 *
 * @param databaseBuilder{DatabaseBuilder}
 * @param badgeId{number}
 * @param targetProfileId{number}
 * @param cappedTubesDTO [{
 *           id: number,
 *           level: number,
 *         }]
 * @param altMessage{string}
 * @param imageUrl{string}
 * @param message{string}
 * @param title{string}
 * @param key{string}
 * @param isCertifiable{boolean}
 * @param isAlwaysVisible{boolean}
 * @param configBadge {criteria: [
 *       {
 *         scope: {('CampaignParticipation','CappedTubes')},
 *         threshold: number,
 *       },
 *     ]}
 * @returns {Promise<{badgeId: number}>} badgeId
 */
async function createBadge({
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
  _createBadge({
    databaseBuilder,
    badgeId,
    targetProfileId,
    altMessage,
    imageUrl,
    message,
    title,
    key,
    isCertifiable,
    isAlwaysVisible,
  });
  _createBadgeCriteria({ databaseBuilder, badgeId, configBadge, cappedTubesDTO });
  await databaseBuilder.commit();
  return {
    badgeId,
  };
}

/**
 * Fonction générique pour créer des paliers selon une configuration donnée.
 * Retourne les IDS des paliers créés.
 *
 * @param databaseBuilder{DatabaseBuilder}
 * @param targetProfileId<number>
 * @param cappedTubesDTO [{
 *           id: number,
 *           level: number
 *         }]
 * @param type {('LEVEL','THRESHOLD')}
 * @param includeFirstSkill<boolean>
 * @param countStages<number>
 * @param shouldInsertPrescriberTitleAndDescription<boolean>
 * @returns {Promise<{stageIds: *[]}>}
 */
async function createStages({
  databaseBuilder,
  targetProfileId,
  cappedTubesDTO,
  type,
  includeFirstSkill = false,
  countStages,
  shouldInsertPrescriberTitleAndDescription,
}) {
  const values = [0];
  const stageIds = [];
  let currentCountStages = countStages;
  if (includeFirstSkill) {
    stageIds.push(
      _createStage({
        databaseBuilder,
        targetProfileId,
        type,
        value: null,
        isFirstSkill: true,
        shouldInsertPrescriberTitleAndDescription,
      }),
    );
    --currentCountStages;
  }
  if (type === 'LEVEL') {
    const maxLevel = _.maxBy(cappedTubesDTO, 'level').level;
    const possibleLevels = Array.from({ length: maxLevel }, (_, i) => i + 1);
    const pickedLevels = _pickRandomAmong(possibleLevels, currentCountStages - 1);
    values.push(...pickedLevels);
  }
  if (type === 'THRESHOLD') {
    const possibleThresholds = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const pickedThresholds = _pickRandomAmong(possibleThresholds, currentCountStages - 1);
    values.push(...pickedThresholds);
  }
  for (const value of values) {
    stageIds.push(
      _createStage({
        databaseBuilder,
        targetProfileId,
        type,
        value,
        isFirstSkill: false,
        shouldInsertPrescriberTitleAndDescription,
      }),
    );
  }
  await databaseBuilder.commit();
  return { stageIds };
}

function _createTargetProfile({
  databaseBuilder,
  targetProfileId,
  name,
  category,
  isPublic,
  ownerOrganizationId,
  isSimplifiedAccess,
  description,
  comment,
  imageUrl,
  outdated,
  attachedOrganizationIds,
}) {
  databaseBuilder.factory.buildTargetProfile({
    id: targetProfileId,
    name,
    category,
    isPublic,
    ownerOrganizationId,
    isSimplifiedAccess,
    description,
    comment,
    imageUrl,
    outdated,
  });
  attachedOrganizationIds.map((organizationId) =>
    databaseBuilder.factory.buildTargetProfileShare({
      targetProfileId,
      organizationId,
    }),
  );
}

function _createBadge({
  databaseBuilder,
  badgeId,
  targetProfileId,
  altMessage,
  imageUrl,
  message,
  title,
  key,
  isCertifiable,
  isAlwaysVisible,
}) {
  databaseBuilder.factory.buildBadge({
    id: badgeId,
    targetProfileId,
    altMessage,
    imageUrl,
    message,
    title,
    key,
    isCertifiable,
    isAlwaysVisible,
  });
}

function _createStage({
  databaseBuilder,
  targetProfileId,
  type,
  value,
  isFirstSkill,
  shouldInsertPrescriberTitleAndDescription,
}) {
  const stageValueStr = isFirstSkill ? 'premier acquis' : `"${value}"`;
  return databaseBuilder.factory.buildStage({
    targetProfileId,
    message: `Message du palier ${stageValueStr} pour le profil cible ${targetProfileId}`,
    title: `Titre du palier ${stageValueStr} pour le profil cible ${targetProfileId}`,
    level: isFirstSkill ? null : type === 'LEVEL' ? value : null,
    threshold: isFirstSkill ? null : type === 'LEVEL' ? null : value,
    isFirstSkill,
    prescriberTitle: shouldInsertPrescriberTitleAndDescription
      ? `Titre prescripteur du palier ${stageValueStr} pour le profil cible ${targetProfileId}`
      : null,
    prescriberDescription: shouldInsertPrescriberTitleAndDescription
      ? `Description prescripteur du palier ${stageValueStr} pour le profil cible ${targetProfileId}`
      : null,
  }).id;
}

function _createTargetProfileTubes({ databaseBuilder, targetProfileId, configTargetProfile }) {
  const cappedTubesDTO = [];
  for (const framework of configTargetProfile.frameworks) {
    const frameworkName = _getFrameworkName(framework);
    for (let i = 0; i < framework.countTubes; ++i) {
      const tubeId = _pickRandomTube(
        frameworkName,
        cappedTubesDTO.map(({ id }) => id),
      );
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
