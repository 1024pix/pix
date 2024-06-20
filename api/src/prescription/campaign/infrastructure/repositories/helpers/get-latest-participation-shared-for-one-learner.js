export const getLatestParticipationSharedForOneLearner = (queryBuilder, columnName, campaignId) =>
  queryBuilder('campaign-participations')
    .select(columnName)
    .orderBy('sharedAt', 'desc')
    .where('organizationLearnerId', queryBuilder.ref('cp.organizationLearnerId'))
    .where({ campaignId })
    .limit(1)
    .as(columnName);
