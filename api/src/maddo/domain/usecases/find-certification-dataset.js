export async function findCertificationDataset({ page, certificationDatasetRepository }) {
  return certificationDatasetRepository.findAll({ page });
}
