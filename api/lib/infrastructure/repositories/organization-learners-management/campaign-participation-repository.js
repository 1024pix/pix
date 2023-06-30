const removeByOrganizationLearnerIds = function ({ organizationLearnerIds, userId, domainTransaction }) {
  return domainTransaction
    .knexTransaction('campaign-participations')
    .whereIn('organizationLearnerId', organizationLearnerIds)
    .whereNull('deletedAt')
    .update({ deletedAt: new Date(), deletedBy: userId });
};

export { removeByOrganizationLearnerIds };
