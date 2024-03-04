import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as complementaryCertificationApi from '../../../complementary-certification/application/api/complementary-certification-api.js';
import * as complementaryCertificationRepository from './complementary-certification-repository.js';
import * as candidateRepository from './candidate-repository.js';
import * as centerRepository from './center-repository.js';
import * as certificationOfficerRepository from './certification-officer-repository.js';
import * as complementaryCertificationRepository from './complementary-certification-repository.js';
import * as finalizedSessionRepository from './finalized-session-repository.js';
import * as jurySessionRepository from './jury-session-repository.js';
import * as sessionForInvigilatorKitRepository from './session-for-invigilator-kit-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {centerRepository} CenterRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 */
const repositoriesWithoutInjectedDependencies = {
  complementaryCertificationRepository,
  candidateRepository,
  centerRepository,
  certificationOfficerRepository,
  finalizedSessionRepository,
  jurySessionRepository,
  sessionForInvigilatorKitRepository,
};

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {complementaryCertificationApi} ComplementaryCertificationApi
 */
const dependencies = {
  complementaryCertificationApi,
};

const sessionRepositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { sessionRepositories };
