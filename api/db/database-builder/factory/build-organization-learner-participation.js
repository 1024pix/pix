import _ from 'lodash';

import { OrganizationLearnerParticipationTypes } from '../../../src/quest/domain/models/combined-course-participations/entities/OrganizationLearnerParticipation.js';
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

  return databaseBuffer.pushInsertable({
    tableName: 'organization_learner_participations',
    values,
  });
};

buildOrganizationLearnerParticipation.ofTypePassage = function buildOrganizationLearnerParticipationOfTypePassage({
  id = databaseBuffer.getNextId(),
  createdAt = new Date(),
  updatedAt = new Date(),
  completedAt = null,
  deletedAt = null,
  deletedBy = null,
  organizationLearnerId,
  status,
  moduleId,
  attributes,
} = {}) {
  organizationLearnerId = _.isUndefined(organizationLearnerId) ? buildOrganizationLearner().id : organizationLearnerId;

  const values = {
    id,
    type: OrganizationLearnerParticipationTypes.PASSAGE,
    createdAt,
    updatedAt,
    completedAt,
    deletedAt,
    deletedBy,
    organizationLearnerId,
    status,
    attributes,
    referenceId: moduleId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'organization_learner_participations',
    values,
  });
};

buildOrganizationLearnerParticipation.ofTypeCombinedCourse =
  function buildOrganizationLearnerParticipationOfTypeCombinedCourse({
    id = databaseBuffer.getNextId(),
    createdAt = new Date(),
    updatedAt = new Date(),
    completedAt = null,
    deletedAt = null,
    deletedBy = null,
    organizationLearnerId,
    status,
    combinedCourseId,
    attributes,
  } = {}) {
    organizationLearnerId = _.isUndefined(organizationLearnerId)
      ? buildOrganizationLearner().id
      : organizationLearnerId;

    const values = {
      id,
      type: OrganizationLearnerParticipationTypes.COMBINED_COURSE,
      createdAt,
      updatedAt,
      completedAt,
      deletedAt,
      deletedBy,
      organizationLearnerId,
      status,
      attributes,
      referenceId: combinedCourseId.toString(),
    };

    return databaseBuffer.pushInsertable({
      tableName: 'organization_learner_participations',
      values,
    });
  };
export { buildOrganizationLearnerParticipation };
