module.exports = function updateCertification({
  certificationId,
  attributesToUpdate: { isPublished },
  certificationRepository
}) {
  return certificationRepository.updatePublicationStatus({
    id: certificationId,
    isPublished,
  });
};
