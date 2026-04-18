import { BaseChallenge, TYPES as ORIGINAL_TYPES } from '../../../shared/domain/models/BaseChallenge.js';
import { Validator } from './Validator.js';
import { ValidatorQCM } from './ValidatorQCM.js';
import { ValidatorQCU } from './ValidatorQCU.js';
import { ValidatorQROC } from './ValidatorQROC.js';
import { ValidatorQROCMDep } from './ValidatorQROCMDep.js';
import { ValidatorQROCMInd } from './ValidatorQROCMInd.js';

/**
 * @class ChallengeForCorrection
 * @extends BaseChallenge
 * @description
 * This model represents a Challenge as used in the evaluation bounded context, regarding when it's about
 * evaluating an answer to a challenge.
 * Although it inherits all fields from BaseChallenge, the following are the
 * only fields documented to be indeed used in evaluation code :
 * @property {string} id
 * @property {string} format
 * @property {string} type
 * @property {string} proposals
 * @property {boolean} focused
 * @property {string} solution
 * @property {string} solutionToDisplay
 * @property {string} competenceId
 * @property {string} skillId
 */
export class ChallengeForCorrection extends BaseChallenge {
  constructor(coreChallenge, solutionAlgo) {
    super(coreChallenge);
    this.solutionAlgo = solutionAlgo;
  }

  get validator() {
    switch (this.type) {
      case TYPES.QCU:
        return new ValidatorQCU({ solution: this.solutionAlgo });

      case TYPES.QCM:
        return new ValidatorQCM({ solution: this.solutionAlgo });

      case TYPES.QROC:
        return new ValidatorQROC({ solution: this.solutionAlgo });

      case TYPES.QROCM_IND:
        return new ValidatorQROCMInd({ solution: this.solutionAlgo });

      case TYPES.QROCM_DEP:
        return new ValidatorQROCMDep({ solution: this.solutionAlgo });

      default:
        return new Validator({ solution: this.solutionAlgo });
    }
  }
}
export const TYPES = ORIGINAL_TYPES;
