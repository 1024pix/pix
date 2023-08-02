const saveFeedback = async function ({ feedback, feedbackRepository }) {
  return feedbackRepository.save(feedback);
};

export { saveFeedback };
