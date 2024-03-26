import { ModelValidationError } from '../../../../shared/domain/errors.js';
import { validateCommonOrganizationLearner } from '../validators/common-organization-learner-validator.js';

class ImportOrganizationLearnerSet {
  #learners;
  #hasValidationFormats;
  #hasUnicityRules;
  #unicityKeys;

  constructor(validationRules) {
    this.#learners = [];
    this.validationRules = validationRules;
    this.#hasUnicityRules = !!validationRules?.unicity;
    this.#hasValidationFormats = !!validationRules?.formats;
    this.#unicityKeys = [];
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
    const unicityKeys = [];
    this.validationRules.unicity.forEach((rule) => {
      unicityKeys.push(learnerAttributes.attributes[rule]);
    });
    const unicityEntity = unicityKeys.join('-');
    if (!this.#unicityKeys.includes(unicityEntity)) {
      this.#unicityKeys.push(unicityEntity);
      return null;
    } else {
      return ModelValidationError.unicityError({
        key: this.validationRules.unicity.join('-'),
      });
    }
  }

  #checkValidations(learnerAttributes) {
    const errors = validateCommonOrganizationLearner(learnerAttributes, this.validationRules.formats);
    if (errors.length > 0) {
      return errors.map((error) => {
        return ModelValidationError.fromJoiError(error);
      });
    }
  }

  get learners() {
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
