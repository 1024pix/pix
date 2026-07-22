import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as answersRepository from '../../infrastructure/repositories/answers-repository.js';
import { historizeAnswers } from './historize-answers.js';

/**
 * @typedef {answersRepository} AnswersRepository
 **/
const dependencies = {
  answersRepository,
};

const usecasesWithoutInjectedDependencies = {
  historizeAnswers,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
