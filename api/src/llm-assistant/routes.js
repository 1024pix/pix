import { conversationRoute } from './application/conversation.route.js';
import { toolExecutionRoute } from './application/tool-execution.route.js';

const llmAssistantRoutes = [conversationRoute, toolExecutionRoute];

export { llmAssistantRoutes };
