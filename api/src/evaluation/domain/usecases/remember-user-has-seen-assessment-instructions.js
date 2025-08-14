import { repositories as injectedRepositories } from '../../infrastructure/repositories/index.js';const rememberUserHasSeenAssessmentInstructions = function({ userId, userRepository = injectedRepositories.userRepository } = {}) {
  return userRepository.updateAssessmentInstructionsInfoAsSeen({ userId });
};

export { rememberUserHasSeenAssessmentInstructions };
