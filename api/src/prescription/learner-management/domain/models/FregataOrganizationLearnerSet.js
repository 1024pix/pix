import { DomainError } from '../../../../shared/domain/errors.js';
import { validateFregataOrganizationLearner } from '../validators/fregata-organization-learner-validator.js';
import { OrganizationLearner } from './OrganizationLearner.js';

const sexPossibleValues = {
  M: 'M',
  F: 'F',
};

class FregataOrganizationLearnerSet {
  constructor() {
    this.learners = [];
    this.existingNationalStudentIds = [];
  }

  addLearner(learnerAttributes) {
    this._performValidation(learnerAttributes);

    const transformedAttributes = this._transform(learnerAttributes);
    const organizationLearner = new OrganizationLearner(transformedAttributes);
    this.learners.push(organizationLearner);
  }

  _performValidation(learnerAttributes) {
    const errors = validateFregataOrganizationLearner(learnerAttributes);

    const unicityError = this._checkOrganizationLearnersUnicity(learnerAttributes.nationalIdentifier);
    if (unicityError) errors.push(unicityError);

    if (errors.length > 0) throw errors;
  }

  _transform(learnerAttributes) {
    const { birthCountryCode, nationalIdentifier, division } = learnerAttributes;

    return {
      ...learnerAttributes,
      birthCountryCode: birthCountryCode.slice(-3),
      nationalStudentId: nationalIdentifier,
      division: division?.trim().replace(/\s+/g, ' '),
      sex: _convertSexCodeToLabel(learnerAttributes.sex),
    };
  }

  _checkOrganizationLearnersUnicity(nationalIdentifier) {
    // we removed JOI unicity validation (uniq)
    // because it took too much time (2h30 for 10000 learners)
    // we did the same validation but manually
    if (this.existingNationalStudentIds.includes(nationalIdentifier)) {
      const err = new DomainError();
      err.key = 'nationalIdentifier';
      err.why = 'uniqueness';

      return err;
    }

    this.existingNationalStudentIds.push(nationalIdentifier);
    return null;
  }
}

function _convertSexCodeToLabel(sexCode) {
  return sexPossibleValues[sexCode.toUpperCase().charAt(0)];
}

export { FregataOrganizationLearnerSet };
