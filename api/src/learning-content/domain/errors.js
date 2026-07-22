import { DomainError } from '../../shared/domain/errors.js';

class SomeTubesNotFoundError extends DomainError {
  /**
   * @param {Array<string>} missingTubeIds
   */
  constructor(missingTubeIds) {
    super(`Some tubes do not exist : ${missingTubeIds}`);
    this.missingTubeIds = missingTubeIds;
  }

}

class NoTubesProvidedError extends DomainError {
  constructor() {
    super('No tubes provided');
  }
}

export { NoTubesProvidedError,SomeTubesNotFoundError };
