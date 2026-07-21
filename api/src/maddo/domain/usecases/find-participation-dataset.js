export async function findParticipationDataset({ page, participationDatasetRepository }) {
  return participationDatasetRepository.findAll({ page });
}
