import * as url from 'node:url';

import { disconnect } from '../../db/knex-database-connection.js';
import { DomainTransaction } from '../../lib/infrastructure/DomainTransaction.js';
import { usecases } from '../../src/prescription/learner-management/domain/usecases/index.js';

async function deleteOrganizationLearnersFromOrganization(organizationId, date) {
  if (date && isNaN(Date.parse(date))) {
    throw new Error("La date passée en paramètre n'est pas valide");
  }

  await DomainTransaction.execute(async () => {
    const engineeringUserId = process.env.ENGINEERING_USER_ID;

    let organizationLearnerToDeleteIds;

    if (date) {
      organizationLearnerToDeleteIds = await _getOrganizationLearnersToDeleteIds({ organizationId, date });

      await _deleteCampaignParticipations({ engineeringUserId, organizationId, date });
    } else {
      const knexConnection = DomainTransaction.getConnection();
      organizationLearnerToDeleteIds = await knexConnection('organization-learners')
        .where({ organizationId })
        .whereNull('deletedAt')
        .pluck('id');
    }

    await usecases.deleteOrganizationLearners({
      organizationLearnerIds: organizationLearnerToDeleteIds,
      userId: engineeringUserId,
    });

    await _anonymizeOrganizationLearners({ organizationId });

    const campaignParticipations = await _anonymizeCampaignParticipations({ organizationId });

    await _detachAssessmentFromCampaignParticipations({ campaignParticipations });
  });
}

function _getOrganizationLearnersToDeleteIds({ organizationId, date }) {
  const knexConnection = DomainTransaction.getConnection();
  return knexConnection('organization-learners')
    .select(['organization-learners.id'])
    .where({ organizationId })
    .whereNull('deletedAt')
    .whereRaw(`? <= ?`, [
      knexConnection('campaign-participations')
        .select('createdAt')
        .whereRaw('"organizationLearnerId" = "organization-learners"."id"')
        .orderBy('createdAt', 'desc')
        .limit(1),
      date,
    ])
    .pluck('organization-learners.id');
}

async function _deleteCampaignParticipations({ engineeringUserId, organizationId, date }) {
  const knexConnection = DomainTransaction.getConnection();
  await knexConnection('campaign-participations')
    .update({
      deletedAt: new Date(),
      deletedBy: engineeringUserId,
    })
    .whereNull('deletedAt')
    .whereRaw('id IN (?)', [
      knexConnection('campaign-participations')
        .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
        .where({ organizationId })
        .pluck('campaign-participations.id'),
    ])
    .andWhere('createdAt', '<=', date);
}

async function _anonymizeOrganizationLearners({ organizationId }) {
  const knexConnection = DomainTransaction.getConnection();
  await knexConnection('organization-learners')
    .update({ firstName: '', lastName: '', userId: null, updatedAt: new Date() })
    .where({ organizationId })
    .whereNotNull('deletedAt');
}

function _anonymizeCampaignParticipations({ organizationId }) {
  const knexConnection = DomainTransaction.getConnection();
  return knexConnection('campaign-participations')
    .update({ participantExternalId: null, userId: null })
    .whereRaw('id IN (?)', [
      knexConnection('campaign-participations')
        .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
        .where({ organizationId })
        .whereNotNull('campaign-participations.deletedAt')
        .pluck('campaign-participations.id'),
    ])
    .returning('id');
}

async function _detachAssessmentFromCampaignParticipations({ campaignParticipations }) {
  const knexConnection = DomainTransaction.getConnection();
  await knexConnection('assessments')
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
