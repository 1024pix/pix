const converse = async function ({ messages, clientTools = {}, documentContext = null, authorizationHeader, forwardedHeaders, apiBaseUrl, llmAgentRepository }) {
  return llmAgentRepository.streamConversationTurn({ messages, clientTools, documentContext, authorizationHeader, forwardedHeaders, apiBaseUrl });
};

export { converse };
