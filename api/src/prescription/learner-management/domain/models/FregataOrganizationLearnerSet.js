import { DomainError } from '../../../../shared/domain/errors.js';
import { validateFregataOrganizationLearner } from '../validators/fregata-organization-learner-validator.js';
import { OrganizationLearner } from './OrganizationLearner.js';

class FregataOrganizationLearnerSet {
  #learners = [];
  #existingNationalStudentIds = [];

  get learners() {
    return this.#learners;
  }

  addLearner(learnerAttributes) {
    this.#performValidation(learnerAttributes);
    const transformedAttributes = this.#transform(learnerAttributes);
    this.#learners.push(new OrganizationLearner(transformedAttributes));
  }

  #performValidation(learnerAttributes) {
    const errors = validateFregataOrganizationLearner(learnerAttributes);
    const unicityError = this.#checkOrganizationLearnersUnicity(learnerAttributes.nationalIdentifier);
    if (unicityError) errors.push(unicityError);
    if (errors.length > 0) throw errors;
  }

  #transform(learnerAttributes) {
    const { birthCountryCode, nationalIdentifier, division } = learnerAttributes;
    return {
      ...learnerAttributes,
      birthCountryCode: birthCountryCode.slice(-3),
      nationalStudentId: nationalIdentifier,
      division: division?.trim().replace(/\s+/g, ' '),
      sex: FregataOrganizationLearnerSet.#convertSexCodeToLabel(learnerAttributes.sex),
    };
  }

  #checkOrganizationLearnersUnicity(nationalIdentifier) {
    // we removed JOI unicity validation (uniq)
    // because it took too much time (2h30 for 10.000 learners)
    // we did the same validation but manually
    if (this.#existingNationalStudentIds.includes(nationalIdentifier)) {
      const err = new DomainError();
      err.key = 'nationalIdentifier';
      err.why = 'uniqueness';
      return err;
    }
    this.#existingNationalStudentIds.push(nationalIdentifier);
    return null;
  }

  static #convertSexCodeToLabel(sexCode) {
    return sexCode.toUpperCase().charAt(0);
  }
}

export { FregataOrganizationLearnerSet };
