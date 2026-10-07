const createOrContinueConversation = ({ conversation, conversationRepository }) => {
  return conversationRepository.stream({ conversation });
};

export { createOrContinueConversation };
