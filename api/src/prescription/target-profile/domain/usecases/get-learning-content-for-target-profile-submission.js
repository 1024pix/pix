const AUTHORIZED_FRAMEWORKS = ['Pix'];

const getLearningContentForTargetProfileSubmission = async function ({ learningContentRepository, locale }) {
  return learningContentRepository.findByFrameworkNames({
    frameworkNames: AUTHORIZED_FRAMEWORKS,
    locale,
  });
};

export { getLearningContentForTargetProfileSubmission };
