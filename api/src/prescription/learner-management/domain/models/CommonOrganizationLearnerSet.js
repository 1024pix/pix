import { EntityValidationRulesError } from '../../../../shared/domain/errors.js';

const ERRORS = {
  PROPERTY_NOT_UNIQ: 'PROPERTY_NOT_UNIQ',
};
class ImportOrganizationLearnerSet {
  #learners;
  #unicityKeys;

  constructor(validationRules) {
    this.#learners = [];
    this.#unicityKeys = [];
    this.validationRules = validationRules;
    this.hasUnicityRules = !!validationRules?.unicity;
  }

  addLearner(learnerAttributes) {
    this.#validateRules(learnerAttributes);
    this.#learners.push(new CommonOrganizationLearner(learnerAttributes));
  }

  #validateRules(learnerAttributes) {
    const errors = [];

    if (this.hasUnicityRules) {
      const unicityError = this.#checkUnicityRule(learnerAttributes);

      if (unicityError) {
        errors.push(unicityError);
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
      return new EntityValidationRulesError({
        code: ERRORS.PROPERTY_NOT_UNIQ,
        key: this.validationRules.unicity.join('-'),
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
