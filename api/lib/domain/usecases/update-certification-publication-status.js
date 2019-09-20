module.exports = function updateCertificationPublicationStatus({
  certificationId,
  isPublished,
  certificationRepository
}) {
  return certificationRepository.updatePublicationStatus({
    id: certificationId,
    isPublished,
  });
};
