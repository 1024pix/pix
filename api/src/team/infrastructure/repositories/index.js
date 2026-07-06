import { injectDependencies } from '../../../../src/shared/infrastructure/utils/dependency-injection.js';
import * as legalDocumentApi from '../../../legal-documents/application/api/legal-documents-api.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { prescriberRepository } from './prescriber-repository.js';

const repositoriesWithoutInjectedDependencies = {
  prescriberRepository,
};

const dependencies = {
  legalDocumentApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

export { repositories };
