const saveCompetenceForScoringConfiguration = async ({ data, competenceForScoringRepository }) => {
  await competenceForScoringRepository.save(data);
};

export { saveCompetenceForScoringConfiguration };
