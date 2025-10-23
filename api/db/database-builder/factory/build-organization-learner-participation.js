import _ from 'lodash';

import { OrganizationLearnerParticipationTypes } from '../../../src/quest/domain/models/OrganizationLearnerParticipation.js';
import { databaseBuffer } from '../database-buffer.js';
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
  attributes,
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
    referenceId: moduleId ?? combinedCourseId?.toString(),
  };

  const organizationLearnerParticipation = databaseBuffer.pushInsertable({
    tableName: 'organization_learner_participations',
    values,
  });

  return {
    ...organizationLearnerParticipation,
  };
};

export { buildOrganizationLearnerParticipation };
