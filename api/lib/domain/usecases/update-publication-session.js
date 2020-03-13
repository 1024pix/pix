module.exports = async function updatePublicationSession({
  sessionId,
  toPublish,
  certificationRepository,
}) {
  await certificationRepository.updatePublicationStatusesBySessionId(sessionId, toPublish);
  return;
};
