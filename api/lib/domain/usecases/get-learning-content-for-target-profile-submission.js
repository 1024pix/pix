const AUTHORIZED_FRAMEWORKS = ['Pix'];

module.exports = async function getLearningContentForTargetProfileSubmission({ learningContentRepository, locale }) {
  return learningContentRepository.findByFrameworkNames({
    frameworkNames: AUTHORIZED_FRAMEWORKS,
    locale,
  });
};
