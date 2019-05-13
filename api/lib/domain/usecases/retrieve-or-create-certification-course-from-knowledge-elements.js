module.exports = async function retrieveOrCreateCertificationCourseFromKnowledgeElements({ certificationChallengesService }) {
  return {
    created: true,
    certificationCourse: await certificationChallengesService.saveChallenges()
  };
};
