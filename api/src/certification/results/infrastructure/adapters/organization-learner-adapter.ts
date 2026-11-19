import * as organizationLearnerApi from '../../../../prescription/organization-learner/application/api/organization-learners-api.js';
import { Learner } from '../../domain/models/Learner.ts';

type Deps = {
  organizationLearnerApi: Pick<typeof organizationLearnerApi, 'findByDivisions'>;
};

/**
 * @param {object} params
 * @param {number} params.organizationId
 * @param {string} params.division
 * @returns {Promise<Learner[]>}
 */
export async function findInOrganizationByDivision({
  organizationId,
  division,
  dependencies = { organizationLearnerApi },
}: {
  organizationId: number;
  division: string;
  dependencies: Deps;
}) {
  const result = await dependencies.organizationLearnerApi.findByDivisions({
    organizationId,
    divisions: [division],
  });

  const organizationLearners: Array<{ id: number }> = result.organizationLearners;

  return organizationLearners.map(
    (organizationLearner) =>
      new Learner({
        id: organizationLearner.id,
      }),
  );
}
