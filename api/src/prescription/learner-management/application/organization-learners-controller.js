import { usecases } from '../domain/usecases/index.js';
import { DomainTransaction } from '../../../../lib/infrastructure/DomainTransaction.js';

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

const organizationLearnersController = { deleteOrganizationLearners };

export { organizationLearnersController };
