import { CsvImportError, ModelValidationError } from '../../../../shared/domain/errors.js';
import { convertDateValue } from '../../../../shared/infrastructure/utils/date-utils.js';
import { validateCommonOrganizationLearner } from '../validators/common-organization-learner-validator.js';

class ImportOrganizationLearnerSet {
  #learners;
  #hasValidationFormats;
  #hasUnicityRules;
  #unicityKeys;
  #errors;
  #organizationId;
  #columnMapping;

  constructor({ organizationId, importFormat }) {
    this.#organizationId = organizationId;
    this.#learners = [];
    this.validationRules = importFormat.config.validationRules;
    this.#hasUnicityRules = !!this.validationRules?.unicity;
    this.#hasValidationFormats = !!this.validationRules?.formats;
    this.#columnMapping = importFormat.config.headers;
    this.#unicityKeys = [];
    this.#errors = [];
  }

  static buildSet() {
    return new ImportOrganizationLearnerSet(...arguments);
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
        learnerAttributes[column.name] = this.#formatLearnerAttribute({ attribute: value, columnName: column.name });
      }
    });

    return learnerAttributes;
  }

  #formatLearnerAttribute({ attribute, columnName }) {
    if (!attribute) return null;

    if (this.validationRules.formats) {
      const dateFormat = this.validationRules.formats.find((rule) => rule.type === 'date' && rule.name === columnName);

      if (dateFormat) {
        return convertDateValue({
          dateString: attribute,
          inputFormat: dateFormat.format,
          alternativeInputFormat: dateFormat.format,
          outputFormat: 'YYYY-MM-DD',
        });
      }
    }

    return attribute.toString();
  }

  addLearners(learners) {
    learners.forEach((learner, index) => {
      try {
        this.#validateRules(learner);
        const commonOrganizationLearner = new CommonOrganizationLearner(
          this.#lineToOrganizationLearnerAttributes(learner),
        );
        this.#learners.push(commonOrganizationLearner);
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
      const line = this.#getCsvLine(index);
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

  #getCsvLine(index) {
    const LEARNER_DATA_CSV_STARTING_AT_LINE = 2;

    return index + LEARNER_DATA_CSV_STARTING_AT_LINE;
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
