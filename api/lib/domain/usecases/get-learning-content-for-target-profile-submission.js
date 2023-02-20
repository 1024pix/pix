const AUTHORIZED_FRAMEWORKS = ['Pix'];

export default async function getLearningContentForTargetProfileSubmission({ learningContentRepository, locale }) {
  return learningContentRepository.findByFrameworkNames({
    frameworkNames: AUTHORIZED_FRAMEWORKS,
    locale,
  });
}
