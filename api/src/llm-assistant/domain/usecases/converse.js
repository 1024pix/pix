const converse = async function ({ messages, authorizationHeader, forwardedHeaders, llmAgentRepository }) {
  return llmAgentRepository.streamConversationTurn({ messages, authorizationHeader, forwardedHeaders });
};

export { converse };
