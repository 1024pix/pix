module.exports = function updateCertification({
  certificationId,
  attributesToUpdate: { isPublished },
  certificationRepository
}) {
  return certificationRepository.updateCertification({
    id: certificationId,
    attributes: { isPublished }
  });
};
