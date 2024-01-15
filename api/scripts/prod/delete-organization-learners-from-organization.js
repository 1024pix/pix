import * as url from 'url';
import { usecases } from '../../src/prescription/learner-management/domain/usecases/index.js';
import { DomainTransaction } from '../../lib/infrastructure/DomainTransaction.js';
import { disconnect } from '../../db/knex-database-connection.js';

async function deleteOrganizationLearnersFromOrganization(organizationId, date) {
  if (date && isNaN(Date.parse(date))) {
    throw new Error("La date passée en paramètre n'est pas valide");
  }

  await DomainTransaction.execute(async (domainTransaction) => {
    const engineeringUserId = process.env.ENGINEERING_USER_ID;

    const knexConn = domainTransaction.knexTransaction;

    let organizationLearnerToDeleteIds;

    if (date) {
      organizationLearnerToDeleteIds = await _getOrganizationLearnersToDeleteIds({ knexConn, organizationId, date });

      await _deleteCampaignParticipations({ knexConn, engineeringUserId, organizationId, date });
    } else {
      organizationLearnerToDeleteIds = await knexConn('organization-learners')
        .where({ organizationId })
        .whereNull('deletedAt')
        .pluck('id');
    }

    await usecases.deleteOrganizationLearners({
      organizationLearnerIds: organizationLearnerToDeleteIds,
      userId: engineeringUserId,
      domainTransaction,
    });

    await _anonymizeOrganizationLearners({ knexConn, organizationId });

    const campaignParticipations = await _anonymizeCampaignParticipations({ knexConn, organizationId });

    await _detachAssessmentFromCampaignParticipations({ knexConn, campaignParticipations });
  });
}

function _getOrganizationLearnersToDeleteIds({ knexConn, organizationId, date }) {
  return knexConn('organization-learners')
    .select(['organization-learners.id'])
    .where({ organizationId })
    .whereNull('deletedAt')
    .whereRaw(`? <= ?`, [
      knexConn('campaign-participations')
        .select('createdAt')
        .whereRaw('"organizationLearnerId" = "organization-learners"."id"')
        .orderBy('createdAt', 'desc')
        .limit(1),
      date,
    ])
    .pluck('organization-learners.id');
}

async function _deleteCampaignParticipations({ knexConn, engineeringUserId, organizationId, date }) {
  await knexConn('campaign-participations')
    .update({
      deletedAt: new Date(),
      deletedBy: engineeringUserId,
    })
    .whereNull('deletedAt')
    .whereRaw('id IN (?)', [
      knexConn('campaign-participations')
        .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
        .where({ organizationId })
        .pluck('campaign-participations.id'),
    ])
    .andWhere('createdAt', '<=', date);
}

async function _anonymizeOrganizationLearners({ knexConn, organizationId }) {
  await knexConn('organization-learners')
    .update({ firstName: '', lastName: '', userId: null, updatedAt: new Date() })
    .where({ organizationId })
    .whereNotNull('deletedAt');
}

function _anonymizeCampaignParticipations({ knexConn, organizationId }) {
  return knexConn('campaign-participations')
    .update({ participantExternalId: '', userId: null })
    .whereRaw('id IN (?)', [
      knexConn('campaign-participations')
        .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
        .where({ organizationId })
        .whereNotNull('campaign-participations.deletedAt')
        .pluck('campaign-participations.id'),
    ])
    .returning('id');
}

async function _detachAssessmentFromCampaignParticipations({ knexConn, campaignParticipations }) {
  await knexConn('assessments')
    .update({ campaignParticipationId: null, updatedAt: new Date() })
    .whereIn(
      'campaignParticipationId',
      campaignParticipations.map((campaignParticipation) => campaignParticipation.id),
    );
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await deleteOrganizationLearnersFromOrganization(process.argv[2], process.argv[3]);
      console.log('done');
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

export { deleteOrganizationLearnersFromOrganization };
