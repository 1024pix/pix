import _ from 'lodash';

import { CombinedCourseBlueprint } from '../../../src/quest/domain/models/combined-course-blueprints/entities/CombinedCourseBlueprint.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildQuest } from './build-quest.js';
import { buildTargetProfile } from './build-target-profile.js';

const buildCombinedCourseBlueprint = function ({
  id = databaseBuffer.getNextId(),
  name = 'Mon parcours combiné',
  internalName = 'Mon schéma de parcours combiné',
  description = 'Le but de ma quête',
  illustration = 'images/illustration.svg',
  createdAt = new Date(),
  updatedAt,
  questId,
  surveyUrl,
} = {}) {
  const targetProfileId = buildTargetProfile().id;
  questId = _.isUndefined(questId)
    ? buildQuest({
        rewardType: null,
        rewardId: null,
        successRequirements: [
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({ targetProfileId }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({
            moduleId: 'eeeb4951-6f38-4467-a4ba-0c85ed71321a',
          }).toDTO(),
        ],
      }).id
    : questId;

  const values = {
    id,
    name,
    internalName,
    description,
    illustration,
    createdAt,
    updatedAt: updatedAt ?? createdAt,
    questId,
    surveyUrl,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'combined_course_blueprints',
    values,
  });
};

export { buildCombinedCourseBlueprint };
