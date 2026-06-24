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
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({
            moduleId: 'f32a2238-4f65-4698-b486-15d51935d335',
          }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({
            moduleId: '6282925d-4775-4bca-b513-4c3009ec5886',
          }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({
            moduleId: '08ef1a47-b691-4138-b899-39f3512fa152',
          }).toDTO(),
          CombinedCourseBlueprint.buildRequirementForCombinedCourse({
            moduleId: 'ab82925d-4775-4bca-b513-4c3009ec5886',
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
