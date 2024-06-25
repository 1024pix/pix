/**
 * @function
 * @name getLatestParticipationSharedForOneLearner
 * @param {Knex.QueryBuilder} queryBuilder
 * @param {string} columnName
 * @param {number} campaignId
 * @description
 * This function is meant to be use as a subquery on the table campaign-participations aliased as "cp"
 * to get latest campaign participation of an organization learner for given campaignId
 *
 * @returns {Knex.QueryBuilder}
 */
export const getLatestParticipationSharedForOneLearner = (queryBuilder, columnName, campaignId) =>
  queryBuilder('campaign-participations')
    .select(columnName)
    .orderBy('sharedAt', 'desc')
    .where('organizationLearnerId', queryBuilder.ref('cp.organizationLearnerId'))
    .where({ campaignId })
    .whereNotNull('sharedAt')
    .limit(1)
    .as(columnName);
