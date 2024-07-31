import _ from 'lodash';

import { PromiseUtils } from '../../../../../src/shared/infrastructure/utils/promise-utils.js';
import * as learningContent from './learning-content.js';

export { createTraining };

const tubeIdsByFramework = {};
let frameworkNames;

/**
 * Fonction générique pour créer un contenu formatif selon une configuration donnée.
 * Retourne l'ID du contenu formatif.
 *
 * @param databaseBuilder{DatabaseBuilder}
 * @param trainingId{number}
 * @param title{string}
 * @param link{string}
 * @param type{string}
 * @param duration{string}
 * @param locale{string}
 * @param editorName{string}
 * @param editorLogoUrl{string}
 * @param attachedTargetProfileIds{Array<number>}
 * @param configTriggers
 *        [
 *          {
 *            type: {('goal','prerequisite')},
 *            threshold: number,
 *            frameworks: [
 *              {
 *                 chooseCoreFramework: boolean,
 *                 countTubes: number,
 *                 minLevel: number,
 *                 maxLevel: number,
 *              },
 *            ],
 *          },
 *        ]
 * @returns {Promise<{trainingId: number}>}
 */
async function createTraining({
  databaseBuilder,
  trainingId,
  title,
  link,
  type,
  duration,
  locale,
  editorName,
  editorLogoUrl,
  attachedTargetProfileIds = [],
  configTriggers,
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
  databaseBuilder.factory.buildTraining({
    id: trainingId,
    title,
    link,
    type,
    duration,
    locale,
    editorName,
    editorLogoUrl,
  });
  attachedTargetProfileIds.map((targetProfileId) =>
    databaseBuilder.factory.buildTargetProfileTraining({
      targetProfileId,
      trainingId,
    }),
  );
  const cappedTubesDTO = [];
  for (const configTrigger of configTriggers) {
    const trainingTriggerId = databaseBuilder.factory.buildTrainingTrigger({
      type: configTrigger.type,
      threshold: configTrigger.threshold,
      trainingId,
    }).id;
    for (const framework of configTrigger.frameworks) {
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
          databaseBuilder.factory.buildTrainingTriggerTube({
            trainingTriggerId,
            tubeId,
            level,
          });
        }
      }
    }
  }

  await databaseBuilder.commit();
  return { trainingId };
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
