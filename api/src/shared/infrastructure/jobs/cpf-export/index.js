import * as cpfCertificationResultRepository from '../../../../certification/session-management/infrastructure/repositories/cpf-certification-result-repository.js';
import { injectDependencies } from '../../utils/dependency-injection.js';
import { planner } from './handlers/planner.js';

const cpfExport = injectDependencies({ planner }, { cpfCertificationResultRepository });

export { cpfExport };
