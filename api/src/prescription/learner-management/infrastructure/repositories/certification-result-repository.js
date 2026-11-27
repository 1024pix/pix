import * as certificationResultApiModule from '../../../../certification/results/application/api/certification-result-api.ts';

const detachOrganizationLearners = async ({
  organizationLearnerIds,
  certificationResultApi = certificationResultApiModule,
}) => {
  await certificationResultApi.detachOrganizationLearners({ organizationLearnerIds });
};

export { detachOrganizationLearners };
