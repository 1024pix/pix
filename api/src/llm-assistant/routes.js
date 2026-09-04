import { conversationRoute } from './application/conversation.route.js';
import { scriptExecutionRoute } from './application/script-execution.route.js';
import { toolExecutionRoute } from './application/tool-execution.route.js';

const llmAssistantRoutes = [conversationRoute, toolExecutionRoute, scriptExecutionRoute];

export { llmAssistantRoutes };
