import { usecases } from '../../domain/usecases/index.js';
import { DomainTransaction } from '../../infrastructure/DomainTransaction.js';
import * as campaignParticipationRepository from '../../infrastructure/repositories/organization-learners-management/campaign-participation-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learners-management/organization-learner-repository.js';

/* 
Pour séparer le code par contexte nous avons introduit un niveau de dossier. 
Pour ce controller, le dossier s'appelle organization-learners-management.
Il existe des repositories "organizationLearnersRepository" et "campaignParticipationRepository" dans le dossier repositories.
Notre injection de dépendances ne permet pas d'avoir deux repositories avec le même nom.
Nous sommes donc obligés d'injecter ces dépendances au niveau de ce controller.
*/
const deleteOrganizationLearners = async function (
  request,
  h,
  dependencies = { organizationLearnerRepository, campaignParticipationRepository },
) {
  const authenticatedUserId = request.auth.credentials.userId;
  const listLearners = request.payload.listLearners;

  await DomainTransaction.execute(async (domainTransaction) => {
    await usecases.deleteOrganizationLearners({
      organizationLearnerIds: listLearners,
      userId: authenticatedUserId,
      organizationLearnerRepository: dependencies.organizationLearnerRepository,
      campaignParticipationRepository: dependencies.campaignParticipationRepository,
      domainTransaction,
    });
  });
  return h.response().code(200);
};

const organizationLearnersController = { deleteOrganizationLearners };

export { organizationLearnersController };
