const removeByIds = function ({ organizationLearnerIds, userId, domainTransaction }) {
  return domainTransaction
    .knexTransaction('organization-learners')
    .whereIn('id', organizationLearnerIds)
    .update({ deletedAt: new Date(), deletedBy: userId });
};

export { removeByIds };
