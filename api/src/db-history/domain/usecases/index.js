import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as answersRepository from '../../infrastructure/repositories/answers-repository.js';
import * as assessmentsRepository from '../../infrastructure/repositories/assessments-repository.js';
import { historizeAnswers } from './historize-answers.js';

/**
 * @typedef {answersRepository} AnswersRepository
 * @typedef {assessmentsRepository} AssessmentsRepository
 **/
const dependencies = {
  answersRepository,
  assessmentsRepository,
};

const usecasesWithoutInjectedDependencies = {
  historizeAnswers,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
