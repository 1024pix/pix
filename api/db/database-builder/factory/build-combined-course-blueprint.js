import _ from 'lodash';

import { CombinedCourseBlueprint } from '../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildQuest } from './build-quest.js';
import { buildTargetProfile } from './build-target-profile.js';
import { buildModule } from './learning-content/build-module.js';

const DEFAULT_MODULE_COUNT = 5;

function _buildDefaultModules() {
  return Array.from({ length: DEFAULT_MODULE_COUNT }, () => {
    const shortId = crypto.randomUUID().slice(0, 8);
    return buildModule({ shortId, slug: `combined-course-blueprint-module-${shortId}` }).id;
  });
}

const buildCombinedCourseBlueprint = function ({
  id = databaseBuffer.getNextId(),
  name = 'Mon parcours combiné',
  internalName = 'Mon schéma de parcours combiné',
  description = 'Le but de ma quête',
  prescriberDescription = 'Le but de ma quête pour le prescripteur',
  illustration = 'http://example.pix/images/illustration.svg',
  createdAt = new Date(),
  updatedAt,
  questId,
  surveyUrl = null,
  rewardRequirementsDescription = null,
} = {}) {
  const targetProfileId = buildTargetProfile().id;
  if (_.isUndefined(questId)) {
    const moduleIds = _buildDefaultModules();
    questId = buildQuest({
      rewardType: null,
      rewardId: null,
      successRequirements: [
        CombinedCourseBlueprint.buildRequirementForCombinedCourse({
          targetProfileId,
        }).toDTO(),
        ...moduleIds.map((moduleId) => CombinedCourseBlueprint.buildRequirementForCombinedCourse({ moduleId }).toDTO()),
      ],
    }).id;
  }

  const values = {
    id,
    name,
    internalName,
    description,
    prescriberDescription,
    illustration,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    questId,
    surveyUrl,
    rewardRequirementsDescription,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'combined_course_blueprints',
    values,
  });
};

export { buildCombinedCourseBlueprint };
