module.exports = function({
  certificationId,
  attributesToUpdate: { isPublished },
  certificationRepository
}) {
  return certificationRepository.updateCertification({
    id: certificationId,
    attributes: { isPublished }
  });
};
