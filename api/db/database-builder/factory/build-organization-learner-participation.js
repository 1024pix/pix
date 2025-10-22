import _ from 'lodash';

import { OrganizationLearnerParticipationTypes } from '../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildCombinedCourseParticipation } from './build-combined-course-participation.js';
import { buildOrganizationLearnerPassageParticipation } from './build-organization-learner-passage-participation.js';
import { buildOrganizationLearner } from './prescription/organization-learners/build-organization-learner.js';

const buildOrganizationLearnerParticipation = function ({
  id = databaseBuffer.getNextId(),
  type = OrganizationLearnerParticipationTypes.PASSAGE,
  createdAt = new Date(),
  updatedAt = new Date(),
  completedAt = null,
  deletedAt = null,
  deletedBy = null,
  organizationLearnerId,
  status,
  moduleId,
  combinedCourseId,
  questId,
  attributes,
  addAttributes = true,
} = {}) {
  organizationLearnerId = _.isUndefined(organizationLearnerId) ? buildOrganizationLearner().id : organizationLearnerId;

  const values = {
    id,
    type,
    createdAt,
    updatedAt,
    completedAt,
    deletedAt,
    deletedBy,
    organizationLearnerId,
    status,
    attributes,
    referenceId: addAttributes ? (moduleId ?? combinedCourseId?.toString()) : null,
  };

  const organizationLearnerParticipation = databaseBuffer.pushInsertable({
    tableName: 'organization_learner_participations',
    values,
  });
  let organizationLearnerPassageId, organizationLearnerCombinedCourseParticipationId;
  if (type === OrganizationLearnerParticipationTypes.PASSAGE) {
    organizationLearnerPassageId = buildOrganizationLearnerPassageParticipation({
      moduleId,
      organizationLearnerParticipationId: organizationLearnerParticipation.id,
    }).id;
  }

  if (type === OrganizationLearnerParticipationTypes.COMBINED_COURSE) {
    organizationLearnerCombinedCourseParticipationId = buildCombinedCourseParticipation({
      organizationLearnerId,
      questId,
      combinedCourseId,
      status,
      createdAt,
      updatedAt,
      organizationLearnerParticipationId: organizationLearnerParticipation.id,
    }).id;
  }

  return {
    ...organizationLearnerParticipation,
    organizationLearnerPassageId,
    organizationLearnerCombinedCourseParticipationId,
  };
};

export { buildOrganizationLearnerParticipation };
