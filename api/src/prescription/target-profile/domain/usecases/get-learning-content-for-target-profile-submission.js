import * as injectedLearningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
const AUTHORIZED_FRAMEWORKS = ['Pix'];

const getLearningContentForTargetProfileSubmission = async function ({
  learningContentRepository = injectedLearningContentRepository,
  locale,
} = {}) {
  return learningContentRepository.findByFrameworkNames({
    frameworkNames: AUTHORIZED_FRAMEWORKS,
    locale,
  });
};

export { getLearningContentForTargetProfileSubmission };
