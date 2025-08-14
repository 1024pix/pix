import * as injectedFeedbackRepository from '../../infrastructure/repositories/feedback-repository.js';
const saveFeedback = async function ({ feedback, feedbackRepository = injectedFeedbackRepository } = {}) {
  return feedbackRepository.save(feedback);
};

export { saveFeedback };
