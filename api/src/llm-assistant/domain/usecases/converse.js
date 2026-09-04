const converse = async function ({ messages, clientTools = {}, documentContext = null, authorizationHeader, forwardedHeaders, serverPort, llmAgentRepository }) {
  return llmAgentRepository.streamConversationTurn({ messages, clientTools, documentContext, authorizationHeader, forwardedHeaders, serverPort });
};

export { converse };
