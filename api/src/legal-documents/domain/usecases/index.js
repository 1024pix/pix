import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { logger } from '../../../shared/infrastructure/utils/logger.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as legalDocumentRepository from '../../infrastructure/repositories/legal-document.repository.js';
import * as userRepository from '../../infrastructure/repositories/user.repository.js';
import * as userAcceptanceRepository from '../../infrastructure/repositories/user-acceptance.repository.js';
import * as userScoRepository from '../../infrastructure/repositories/user-sco.repository.js';

const repositories = {
  legalDocumentRepository,
  userAcceptanceRepository,
  userRepository,
  userScoRepository,
};

const dependencies = Object.assign({ logger }, repositories);

import { acceptLegalDocumentByUserId } from './accept-legal-document-by-user-id.usecase.js';
import { createLegalDocument } from './create-legal-document.usecase.js';
import { getLegalDocumentStatusByUserId } from './get-legal-document-status-by-user-id.usecase.js';

const usecasesWithoutInjectedDependencies = {
  acceptLegalDocumentByUserId,
  createLegalDocument,
  getLegalDocumentStatusByUserId,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
