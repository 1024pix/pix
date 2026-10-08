import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as repositories from '../../infrastructure/repositories/index.js';
import { createOrContinueConversation } from './create-or-continue-conversation.js';

const dependencies = { ...repositories };

const usecasesWithoutInjectedDependencies = {
  createOrContinueConversation,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
