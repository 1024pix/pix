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
    const learner = new CommonOrganizationLearner(learnerAttributes);
    this.#validateRules(learner);
    this.#learners.push(learner);
  }

  #validateRules(learner) {
    const learnerAttributes = {
      ...learner,
      attributes: { ...learner.attributes, firstName: learner.firstName, lastName: learner.lastName },
    };
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
    const learnerUnicityValues = this.#getLearnerUnicityValues(learnerAttributes);
    if (!this.#unicityKeys.includes(learnerUnicityValues)) {
      this.#unicityKeys.push(learnerUnicityValues);
      return null;
    } else {
      return ModelValidationError.unicityError({
        key: this.validationRules.unicity.join('-'),
      });
    }
  }

  #getLearnerUnicityValues(learnerAttributes) {
    const unicityKeys = [];
    this.validationRules.unicity.forEach((rule) => {
      unicityKeys.push(learnerAttributes.attributes[rule]);
    });
    return unicityKeys.join('-');
  }

  #checkValidations(learnerAttributes) {
    return validateCommonOrganizationLearner(learnerAttributes, this.validationRules.formats);
  }

  get learners() {
    return this.#learners;
  }
}

class CommonOrganizationLearner {
  constructor({ id, userId, lastName, firstName, organizationId, ...attributes } = {}) {
    if (id) this.id = id;
    if (userId) this.userId = userId;
    this.lastName = lastName;
    this.firstName = firstName;
    this.organizationId = organizationId;
    if (attributes) this.attributes = attributes;
  }
}

export { CommonOrganizationLearner, ImportOrganizationLearnerSet };
