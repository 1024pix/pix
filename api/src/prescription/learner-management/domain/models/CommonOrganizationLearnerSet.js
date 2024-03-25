import { EntityValidationRulesError } from '../../../../shared/domain/errors.js';
import { validateCommonOrganizationLearner } from '../validators/common-organization-learner-validator.js';

class ImportOrganizationLearnerSet {
  #learners;
  #hasValidationFormats;
  #hasUnicityRules;

  constructor(validationRules) {
    this.#learners = [];
    this.validationRules = validationRules;
    this.#hasUnicityRules = !!validationRules?.unicity;
    this.#hasValidationFormats = !!validationRules?.formats;
  }

  addLearner(learnerAttributes) {
    this.#validateRules(learnerAttributes);
    this.#learners.push(new CommonOrganizationLearner(learnerAttributes));
  }

  #validateRules(learnerAttributes) {
    const errors = [];

    if (this.#hasUnicityRules) {
      const unicityError = this.#checkUnicityRule(learnerAttributes);

      if (unicityError) {
        errors.push(unicityError);
      }
    }

    if (this.#hasValidationFormats) {
      const validationErrors = this.#checkValidations(learnerAttributes);

      if (validationErrors) {
        errors.push(...validationErrors);
      }
    }

    if (errors.length > 0) {
      throw errors;
    }
  }

  #checkUnicityRule(learnerAttributes) {
    const checkNotUniq = function (learnerToCheck, validationRules) {
      return function (learner) {
        return validationRules.unicity.every((rule) => learner.attributes[rule] === learnerToCheck.attributes[rule]);
      };
    };

    if (this.#learners.some(checkNotUniq(learnerAttributes, this.validationRules))) {
      return EntityValidationRulesError.unicityError({
        key: this.validationRules.unicity.join('-'),
      });
    }
    return null;
  }

  #checkValidations(learnerAttributes) {
    const errors = validateCommonOrganizationLearner(learnerAttributes, this.validationRules.formats);
    if (errors.length > 0) {
      return errors.map((error) => {
        return EntityValidationRulesError.fromJoiError(error);
      });
    }
  }

  getLearners() {
    return this.#learners;
  }
}

class CommonOrganizationLearner {
  constructor({ id, userId, lastName, firstName, organizationId, attributes } = {}) {
    if (id) this.id = id;
    if (userId) this.userId = userId;
    this.lastName = lastName;
    this.firstName = firstName;
    this.organizationId = organizationId;
    if (attributes) this.attributes = attributes;
  }
}

export { CommonOrganizationLearner, ImportOrganizationLearnerSet };
