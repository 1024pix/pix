import { DomainTransaction } from '../../../shared/domain/DomainTransaction.js';
import { ApplicationTransaction } from '../../shared/infrastructure/ApplicationTransaction.js';
import { usecases } from '../domain/usecases/index.js';

const deleteOrganizationLearners = async function (request, h) {
  const authenticatedUserId = request.auth.credentials.userId;
  const listLearners = request.payload.listLearners;

  await DomainTransaction.execute(async (domainTransaction) => {
    await usecases.deleteOrganizationLearners({
      organizationLearnerIds: listLearners,
      userId: authenticatedUserId,
      domainTransaction,
    });
  });
  return h.response().code(200);
};

const importOrganizationLearnerFromFeature = async function (request, h) {
  const organizationId = request.params.organizationId;
  const userId = request.auth.credentials.userId;

  await ApplicationTransaction.execute(async () => {
    await usecases.sendOrganizationLearnersFile({ payload: request.payload, organizationId, userId });
  });
  await ApplicationTransaction.execute(async () => {
    await usecases.validateOrganizationLearnersFile({ organizationId });
  });
  await ApplicationTransaction.execute(async () => {
    await usecases.saveOrganizationLearnersFile({ organizationId });
  });

  return h.response().code(204);
};

const organizationLearnersController = { deleteOrganizationLearners, importOrganizationLearnerFromFeature };

export { organizationLearnersController };
