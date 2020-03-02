module.exports = async function updatePublicationSession({
  sessionId,
  toPublish,
  certificationCourseRepository,
}) {
  const certificationCoursesToPublish = await certificationCourseRepository.findIdsBySessionId(sessionId);

  if (certificationCoursesToPublish.length > 0) {
    await certificationCoursesToPublish.forEach(async (certifId) => {
      await certificationCourseRepository.update({
        id: certifId,
        isPublished: toPublish
      });
    });
  }

  return null;
};
