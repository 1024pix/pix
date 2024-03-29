const updateBadgeCriterion = async ({ badgeCriterion, badgeCriteriaRepository }) => {
  return badgeCriteriaRepository.updateCriterion({ badgeCriterion });
};

export { updateBadgeCriterion };
