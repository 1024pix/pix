import dayjs from 'dayjs';
import Joi from 'joi';

import { CampaignParticipationStatuses } from '../../prescription/shared/domain/constants.js';
import { usecases } from '../../quest/domain/usecases/index.js';
import { Script } from '../../shared/application/scripts/script.js';
import { ScriptRunner } from '../../shared/application/scripts/script-runner.js';
import { DomainTransaction } from '../../shared/domain/DomainTransaction.js';

export const PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS = [107068, 107074, 107078];
const isoDateSchema = Joi.date().iso();

const startDateDefault = '2024-12-01';
const endDateDefault = '2024-12-03';
const numberOfDaysLimitDefault = 7;

/**
 * @param {string} startDate
 * @param {string} endDate
 *
 * @returns {Promise<[number]>}
 */
export const fetchUserIds = async (startDate = startDateDefault, endDate = endDateDefault) => {
  const knexConnection = DomainTransaction.getConnection();
  const users = await knexConnection('campaign-participations')
    .select('campaign-participations.userId')
    .join('campaigns', 'campaign-participations.campaignId', 'campaigns.id')
    .join('target-profiles', 'campaigns.targetProfileId', 'target-profiles.id')
    .where('campaign-participations.createdAt', '>=', startDate)
    .where('campaign-participations.createdAt', '<=', endDate)
    .where('campaign-participations.status', '<>', CampaignParticipationStatuses.STARTED)
    .whereIn('campaigns.targetProfileId', PRODUCTION_SIXTH_GRADE_TARGET_PROFILE_IDS);

  return users.map(({ userId }) => userId);
};

/**
 * @param {Date} date
 *
 * @throws {Error}
 */
const checkDateFormat = (date) => {
  const dateValidationResult = isoDateSchema.validate(date);

  if (dateValidationResult.error) {
    throw new Error(dateValidationResult.error.message);
  }
};

/**
 * @param startDate
 * @param endDate
 */
const checkEndDateBeforeStartDate = (startDate, endDate) => {
  if (endDate < startDate) {
    throw new Error('The end date must be greater than the start date');
  }
};

/**
 * @param startDate
 * @param endDate
 */
const checkDifferenceBetweenDates = (startDate, endDate) => {
  if (dayjs(endDate).diff(startDate, 'day') > numberOfDaysLimitDefault) {
    throw new Error('The difference between the two dates must be less than 7 days');
  }
};

export class SixthGradeAttestationRewardScript extends Script {
  constructor() {
    super({
      description:
        'This script awards attestations to sixth-grade students who have already completed a campaign linked to a target profile linked to them',
      permanent: true,
      options: {
        firstDateLimitDefault: startDateDefault,
        secondDateLimitDefault: endDateDefault,
      },
    });
  }

  /**
   * @param {{startDate : string, endDate : string}} options
   * @param {{info:function}} logger
   * @param {function} rewardUser
   * @returns {Promise<void>}
   */
  async handle({ options, logger, rewardUser = usecases.rewardUser }) {
    const startDate = new Date(options.startDate || startDateDefault);
    const endDate = new Date(options.endDate || endDateDefault);

    checkDateFormat(startDate);
    checkDateFormat(endDate);
    checkEndDateBeforeStartDate(startDate, endDate);
    checkDifferenceBetweenDates(startDate, endDate);

    logger.info(`Fetching users between ${startDate} and ${endDate}`);

    const users = await fetchUserIds(startDate.toISOString(), endDate.toISOString());

    if (users.length === 0) {
      logger.info('No user found');
      return;
    }

    logger.info(`${users.length} users found`);

    for (const userId of users) {
      try {
        await rewardUser({
          userId,
        });
      } catch (error) {
        logger.error(`Error while treating user ${userId}`, error);
        throw error;
      }

      logger.info(`Treatment completed for user ${userId}`);
    }
  }
}

await ScriptRunner.execute(import.meta.url, SixthGradeAttestationRewardScript);
