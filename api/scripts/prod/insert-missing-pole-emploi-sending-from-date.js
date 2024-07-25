import * as url from 'node:url';

import dayjs from 'dayjs';

import { disconnect, knex } from '../../db/knex-database-connection.js';
import { PoleEmploiPayload } from '../../lib/infrastructure/externals/pole-emploi/PoleEmploiPayload.js';
import * as badgeAcquisitionRepository from '../../lib/infrastructure/repositories/badge-acquisition-repository.js';
import { campaignParticipationResultRepository } from '../../lib/infrastructure/repositories/campaign-participation-result-repository.js';
import * as campaignRepository from '../../lib/infrastructure/repositories/campaign-repository.js';
import * as poleEmploiSendingRepository from '../../lib/infrastructure/repositories/pole-emploi-sending-repository.js';
import * as targetProfileRepository from '../../lib/infrastructure/repositories/target-profile-repository.js';
import * as badgeRepository from '../../src/evaluation/infrastructure/repositories/badge-repository.js';
import * as userRepository from '../../src/identity-access-management/infrastructure/repositories/user.repository.js';
import * as campaignParticipationRepository from '../../src/prescription/campaign-participation/infrastructure/repositories/campaign-participation-repository.js';
import { CampaignParticipationStatuses } from '../../src/prescription/shared/domain/constants.js';
import { Assessment } from '../../src/shared/domain/models/Assessment.js';
import { PoleEmploiSending } from '../../src/shared/domain/models/PoleEmploiSending.js';
import * as assessmentRepository from '../../src/shared/infrastructure/repositories/assessment-repository.js';
import * as organizationRepository from '../../src/shared/infrastructure/repositories/organization-repository.js';
import { logger } from '../../src/shared/infrastructure/utils/logger.js';

async function insertMissingPoleEmploiSendingFromDate(startDate, endDate = new Date(), campaignCode = 'YOURCODE') {
  const start = dayjs(startDate, 'YYYY-MM-DD');
  const end = dayjs(endDate, 'YYYY-MM-DD');

  if (!start.isValid()) {
    throw new Error("La date de début n'est pas valide");
  }

  if (!end.isValid()) {
    throw new Error("La date de fin n'est pas valide");
  }

  if (!start.isBefore(end, 'day')) {
    throw new Error('La date de fin est antérieur à la date de début');
  }

  const campaignByCode = await knex('id').from('campaigns').where({ code: campaignCode }).first();

  if (!campaignByCode) {
    throw new Error("Le code campagne fourni n'existe pas");
  }

  const campaign = await campaignRepository.get(campaignByCode.id);
  const organization = await organizationRepository.get(campaign.organizationId);

  if (!campaign.isAssessment() || !organization.isPoleEmploi) {
    throw new Error('La campagne ne respecte pas les conditions pour générer les événements');
  }

  const startedParticipations = await _getStartedParticipationsInsideIntervall(campaign.id, start, end);
  logger.info('Started Participation found :', startedParticipations.length);

  const toShareParticipations = await _getToShareParticipationsInsideIntervall(campaign.id, start, end);
  logger.info('To Share Participation found :', toShareParticipations.length);

  const sharedParticipations = await _getSharedParticipationsInsideIntervall(campaign.id, start, end);
  logger.info('Shared Participation found :', sharedParticipations.length);

  const campaignParticipationIds = _aggregatePoleEmploiSendingsToCreateByCampaignParticipation(
    startedParticipations,
    toShareParticipations,
    sharedParticipations,
  );

  // common data for all campaign
  const targetProfile = await targetProfileRepository.get(campaign.targetProfileId);
  const badges = await badgeRepository.findByCampaignId(campaign.id);
  const badgeIds = badges.map((badge) => badge.id);
  const responseCode = `SCRIPT_${startDate}_to_${endDate}`;

  // Start to INSERT PoleEmploiSendingsJobs
  for (const [campaignParticipationId, poleEmploiSendingTypes] of Object.entries(campaignParticipationIds)) {
    const participation = await campaignParticipationRepository.get(campaignParticipationId);
    const user = await userRepository.get(participation.userId);

    //handle-pole-emploi-participation-started
    if (poleEmploiSendingTypes.includes(PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START))
      await _buildStartSendingParticipation({ campaign, participation, user, targetProfile, responseCode });

    //handle-pole-emploi-participation-finished
    if (poleEmploiSendingTypes.includes(PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION))
      await _buildCompletionSendingParticipation({ campaign, participation, user, targetProfile, responseCode });

    //send-shared-participation-results-to-pole-emploi
    if (poleEmploiSendingTypes.includes(PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING))
      await _buildSharingSendingParticipation({
        campaign,
        participation,
        user,
        targetProfile,
        badges,
        badgeIds,
        responseCode,
      });
  }
}

const modulePath = url.fileURLToPath(import.meta.url);
const isLaunchedFromCommandLine = process.argv[1] === modulePath;

(async () => {
  if (isLaunchedFromCommandLine) {
    try {
      await insertMissingPoleEmploiSendingFromDate(process.argv[2], process.argv[3], process.argv[4]);
      console.log('done');
    } catch (error) {
      console.error(error);
      process.exitCode = 1;
    } finally {
      await disconnect();
    }
  }
})();

async function _buildStartSendingParticipation({ campaign, participation, user, targetProfile, responseCode }) {
  const payload = PoleEmploiPayload.buildForParticipationStarted({
    user,
    campaign,
    targetProfile,
    participation,
  });

  const poleEmploiSending = PoleEmploiSending.buildForParticipationStarted({
    campaignParticipationId: participation.id,
    payload: payload.toString(),
    isSuccessful: false,
    responseCode,
  });

  return poleEmploiSendingRepository.create({ poleEmploiSending });
}

async function _buildCompletionSendingParticipation({ campaign, participation, user, targetProfile, responseCode }) {
  const assessment = await assessmentRepository.get(participation.lastAssessment.id);

  const payload = PoleEmploiPayload.buildForParticipationFinished({
    user,
    campaign,
    targetProfile,
    participation,
    assessment,
  });

  const poleEmploiSending = PoleEmploiSending.buildForParticipationFinished({
    campaignParticipationId: participation.id,
    payload: payload.toString(),
    isSuccessful: false,
    responseCode,
  });

  return poleEmploiSendingRepository.create({ poleEmploiSending });
}

async function _buildSharingSendingParticipation({
  campaign,
  participation,
  user,
  targetProfile,
  badges,
  badgeIds,
  responseCode,
}) {
  const badgeAcquiredIds = await badgeAcquisitionRepository.getAcquiredBadgeIds({
    badgeIds,
    userId: participation.userId,
  });
  const participationResult = await campaignParticipationResultRepository.getByParticipationId(participation.id);

  const payload = PoleEmploiPayload.buildForParticipationShared({
    user,
    campaign,
    targetProfile,
    participation,
    participationResult,
    badges,
    badgeAcquiredIds,
  });

  const poleEmploiSending = PoleEmploiSending.buildForParticipationShared({
    campaignParticipationId: participation.id,
    payload: payload.toString(),
    isSuccessful: false,
    responseCode,
  });

  return poleEmploiSendingRepository.create({ poleEmploiSending });
}

function _aggregatePoleEmploiSendingsToCreateByCampaignParticipation(
  startedParticipations,
  toShareParticipations,
  sharedParticipations,
) {
  const campaignParticipationIds = {};

  startedParticipations.forEach((participation) => {
    _insertPoleEmploiSending(
      campaignParticipationIds,
      participation,
      PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
    );
  });

  toShareParticipations.forEach((participation) => {
    _insertPoleEmploiSending(
      campaignParticipationIds,
      participation,
      PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
    );
    _insertPoleEmploiSending(
      campaignParticipationIds,
      participation,
      PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
    );
  });

  sharedParticipations.forEach((participation) => {
    _insertPoleEmploiSending(
      campaignParticipationIds,
      participation,
      PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_START,
    );
    _insertPoleEmploiSending(
      campaignParticipationIds,
      participation,
      PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_COMPLETION,
    );
    _insertPoleEmploiSending(
      campaignParticipationIds,
      participation,
      PoleEmploiSending.TYPES.CAMPAIGN_PARTICIPATION_SHARING,
    );
  });

  return campaignParticipationIds;
}

function _insertPoleEmploiSending(campaignParticipationIds, participation, type) {
  if (!participation.types || !participation.types.includes(type)) {
    if (!campaignParticipationIds[participation.campaignParticipationId]) {
      campaignParticipationIds[participation.campaignParticipationId] = [];
    }

    campaignParticipationIds[participation.campaignParticipationId].push(type);
  }
}

function _getStartedParticipationsInsideIntervall(campaignId, startDate, endDate) {
  return knex
    .with('createdAtWithParticipationId', (queryBuilder) => {
      queryBuilder
        .select({
          campaignParticipationId: 'campaign-participations.id',
        })
        .from('campaign-participations')
        .where({ campaignId, status: CampaignParticipationStatuses.STARTED })
        .whereBetween('createdAt', [startDate, endDate]);
    })
    .select({
      campaignParticipationId: 'createdAtWithParticipationId.campaignParticipationId',
      types: knex.raw('string_agg("pole-emploi-sendings"."type", \',\')'),
    })
    .from('createdAtWithParticipationId')
    .leftJoin(
      'pole-emploi-sendings',
      'pole-emploi-sendings.campaignParticipationId',
      'createdAtWithParticipationId.campaignParticipationId',
    )
    .groupBy('createdAtWithParticipationId.campaignParticipationId')
    .havingRaw('count("pole-emploi-sendings"."id") = 0');
}

function _getSharedParticipationsInsideIntervall(campaignId, startDate, endDate) {
  return knex
    .with('createdAtWithParticipationId', (queryBuilder) => {
      queryBuilder
        .select({
          campaignParticipationId: 'campaign-participations.id',
        })
        .from('campaign-participations')
        .where({ campaignId, status: CampaignParticipationStatuses.SHARED })
        .whereBetween('sharedAt', [startDate, endDate]);
    })
    .select({
      campaignParticipationId: 'createdAtWithParticipationId.campaignParticipationId',
      types: knex.raw('string_agg("pole-emploi-sendings"."type", \',\')'),
    })
    .from('createdAtWithParticipationId')
    .leftJoin(
      'pole-emploi-sendings',
      'pole-emploi-sendings.campaignParticipationId',
      'createdAtWithParticipationId.campaignParticipationId',
    )
    .groupBy('createdAtWithParticipationId.campaignParticipationId');
}

function _getToShareParticipationsInsideIntervall(campaignId, startDate, endDate) {
  return knex
    .with('createdAtWithParticipationId', (queryBuilder) => {
      queryBuilder
        .select({
          campaignParticipationId: 'assessments.campaignParticipationId',
          createdAt: 'answers.createdAt',
        })
        .from('answers')
        .join('assessments', function () {
          this.on('assessments.id', 'answers.assessmentId')
            .andOnVal('assessments.state', Assessment.states.COMPLETED)
            .andOnVal('assessments.isImproving', knex.raw('IS'), knex.raw('false'))
            .andOnVal(
              'assessments.campaignParticipationId',
              knex.raw('IN'),
              knex.select('id').from('campaign-participations').where({
                campaignId,
                status: CampaignParticipationStatuses.TO_SHARE,
              }),
            );
        })
        .whereBetween('answers.createdAt', [startDate, endDate]);
    })
    .with('oneDateByParticipation', (queryBuilder) => {
      queryBuilder
        .select('campaignParticipationId')
        .max('createdAt')
        .from('createdAtWithParticipationId')
        .groupBy('campaignParticipationId');
    })
    .select({
      campaignParticipationId: 'oneDateByParticipation.campaignParticipationId',
      types: knex.raw('string_agg("pole-emploi-sendings"."type", \',\')'),
    })
    .from('oneDateByParticipation')
    .leftJoin(
      'pole-emploi-sendings',
      'pole-emploi-sendings.campaignParticipationId',
      'oneDateByParticipation.campaignParticipationId',
    )
    .groupBy('oneDateByParticipation.campaignParticipationId')
    .havingRaw('count("pole-emploi-sendings"."id") <= 1');
}

export { insertMissingPoleEmploiSendingFromDate };
