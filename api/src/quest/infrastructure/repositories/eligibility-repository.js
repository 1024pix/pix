import { Eligibility } from '../../domain/models/Eligibility.js';

import * as injectedOrganizationLearnerWithParticipationApi from '../../../prescription/organization-learner/application/api/organization-learners-with-participations-api.js';import * as injectedModulesApi from '../../../devcomp/application/api/modules-api.js';

export const find = async (
  { userId, organizationLearnerWithParticipationApi = injectedOrganizationLearnerWithParticipationApi } = {},
) => {
  const result = await organizationLearnerWithParticipationApi.find({ userIds: [userId] });
  return result.map(toDomain);
};

export const findByUserIdAndOrganizationId = async (
  {
    userId,
    organizationId,
    organizationLearnerWithParticipationApi = injectedOrganizationLearnerWithParticipationApi,
    modulesApi = injectedModulesApi,
    moduleIds = [],
  } = {},
) => {
  const passages = await modulesApi.getUserModuleStatuses({ userId, moduleIds });
  const result = await organizationLearnerWithParticipationApi.getByUserIdAndOrganizationId({ userId, organizationId });
  return toDomain({ ...result, passages });
};

const toDomain = (organizationLearnersWithParticipations) => new Eligibility(organizationLearnersWithParticipations);
