import { CsvImportError, ModelValidationError } from '../../../../shared/domain/errors.js';
import { convertDateValue } from '../../../../shared/infrastructure/utils/date-utils.js';
import { validateCommonOrganizationLearner } from '../validators/common-organization-learner-validator.js';

const CSV_LEARNER_STARTING_LINE = 2;
class ImportOrganizationLearnerSet {
  #learners;
  #hasValidationFormats;
  #hasUnicityRules;
  #unicityKeys;
  #errors;
  #organizationId;
  #columnMapping;

  constructor({ organizationId, validationRules, columnMapping }) {
    this.#organizationId = organizationId;
    this.#learners = [];
    this.validationRules = validationRules;
    this.#hasUnicityRules = !!validationRules?.unicity;
    this.#hasValidationFormats = !!validationRules?.formats;
    this.#columnMapping = columnMapping;
    this.#unicityKeys = [];
    this.#errors = [];
  }

  #lineToOrganizationLearnerAttributes(learner) {
    const learnerAttributes = {
      organizationId: this.#organizationId,
    };

    this.#columnMapping.forEach((column) => {
      const value = learner[column.name];
      if (column.property) {
        learnerAttributes[column.property] = value;
      } else {
        learnerAttributes[column.name] = value?.toString();
      }
    });

    return learnerAttributes;
  }

  addLearners(learners) {
    learners.forEach((learner, index) => {
      try {
        this.#validateRules(learner);
        const commonOrgainzationLearner = new CommonOrganizationLearner(
          this.#lineToOrganizationLearnerAttributes(learner),
        );
        const convertedLearner = this.#convertLearnerDates(commonOrgainzationLearner);
        this.#learners.push(convertedLearner);
      } catch (errors) {
        this.#handleValidationError(errors, index);
      }
    });

    if (this.#errors.length > 0) {
      throw this.#errors;
    }
  }

  #handleValidationError(errors, index) {
    errors.forEach((error) => {
      const line = index + CSV_LEARNER_STARTING_LINE;
      const field = error.key;

      if (error.why === 'uniqueness') {
        this.#errors.push(new CsvImportError(error.code, { line, field }));
      }

      if (error.why === 'date_format') {
        this.#errors.push(new CsvImportError(error.code, { line, field, acceptedFormat: error.acceptedFormat }));
      }

      if (error.why === 'field_required') {
        this.#errors.push(new CsvImportError(error.code, { line, field }));
      }
    });
  }

  #checkUnicityRule(learner) {
    const learnerUnicityValues = this.#getLearnerUnicityValues(learner);
    if (!this.#unicityKeys.includes(learnerUnicityValues)) {
      this.#unicityKeys.push(learnerUnicityValues);
      return null;
    } else {
      return ModelValidationError.unicityError({
        key: this.validationRules.unicity.join('-'),
      });
    }
  }

  #getLearnerUnicityValues(learner) {
    const unicityKeys = [];
    this.validationRules.unicity.forEach((rule) => {
      unicityKeys.push(learner[rule]);
    });
    return unicityKeys.join('-');
  }

  #validateRules(learner) {
    const errors = [];

    if (this.#hasUnicityRules) {
      const unicityError = this.#checkUnicityRule(learner);

      if (unicityError) {
        errors.push(unicityError);
      }
    }

    if (this.#hasValidationFormats) {
      const validationErrors = this.#checkValidations(learner);

      if (validationErrors) {
        errors.push(...validationErrors);
      }
    }

    if (errors.length > 0) {
      throw errors;
    }
  }

  #checkValidations(learner) {
    return validateCommonOrganizationLearner(learner, this.validationRules.formats);
  }

  get learners() {
    return this.#learners;
  }

  #convertLearnerDates(learner) {
    const datesConfig = this.validationRules?.formats?.filter((rule) => rule.type === 'date');
    if (datesConfig) {
      datesConfig.forEach((dateConfig) => {
        const dateString = learner.attributes[dateConfig.name];
        const convertedDate = convertDateValue({
          dateString,
          inputFormat: dateConfig.format,
          alternativeInputFormat: dateConfig.format,
          outputFormat: 'YYYY-MM-DD',
        });
        learner.attributes[dateConfig.name] = convertedDate || dateString;
      });
    }
    return learner;
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
