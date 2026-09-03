const converse = async function ({ messages, clientTools = {}, documentContext = null, authorizationHeader, forwardedHeaders, llmAgentRepository }) {
  return llmAgentRepository.streamConversationTurn({ messages, clientTools, documentContext, authorizationHeader, forwardedHeaders });
};

export { converse };
