const reconcileSupOrganizationLearner = async function ({
  organizationId,
  reconciliationInfo: { userId, studentNumber, firstName, lastName, birthdate },
  supOrganizationLearnerRepository,
  organizationLearnerRepository,
  userReconciliationService,
}) {
  const matchedOrganizationLearner =
    await userReconciliationService.findMatchingSupOrganizationLearnerIdForGivenOrganizationIdAndUser({
      organizationId,
      reconciliationInfo: { studentNumber, firstName, lastName, birthdate },
      supOrganizationLearnerRepository,
    });

  return organizationLearnerRepository.reconcileUserToOrganizationLearner({
    userId,
    organizationLearnerId: matchedOrganizationLearner.id,
  });
};

export { reconcileSupOrganizationLearner };
