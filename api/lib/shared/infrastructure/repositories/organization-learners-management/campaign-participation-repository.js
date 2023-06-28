const removeByOrganizationLearnerIds = function ({ organizationLearnerIds, userId, domainTransaction }) {
  return domainTransaction
    .knexTransaction('campaign-participations')
    .whereIn('organizationLearnerId', organizationLearnerIds)
    .update({ deletedAt: new Date(), deletedBy: userId });
};

export { removeByOrganizationLearnerIds };
