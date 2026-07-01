import { VALIDATION_ERRORS } from '../../../../shared/constants.js';
import {
  CsvImportError,
  ImportLearnerConfigurationError,
  ModelValidationError,
} from '../../../../shared/domain/errors.js';
import { convertDateValue } from '../../../../shared/infrastructure/utils/date-utils.js';
import { CommonOrganizationLearner } from '../models/CommonOrganizationLearner.js';
import { validateCommonOrganizationLearner } from '../validators/common-organization-learner-validator.js';
import { CommonOrganizationLearnerFilter } from './CommonOrganizationLearnerFilter.js';

class ImportOrganizationLearnerSet {
  #learners;
  #existingLearners;
  #organizationId;

  #validationRuleList;

  #columnMapping;

  #unicityKeys;

  #unicityColumns;
  #unicityColumnMapping;

  #errors;

  constructor({ organizationId, importFormat }) {
    this.#organizationId = organizationId;

    this.#unicityColumns = importFormat.config.unicityColumns;

    this.#validationRuleList = importFormat.config.headers.flatMap((header) => {
      return header.config?.validate ? { name: header.name, ...header.config?.validate } : [];
    });

    this.#columnMapping = importFormat.config.headers;

    this.#learners = [];
    this.#existingLearners = [];

    this.#unicityKeys = new Map();
    this.#errors = [];
    this.#constructorValidation();

    this.#setUnicityColumnMapping();
  }

  static buildSet() {
    return new ImportOrganizationLearnerSet(...arguments);
  }

  #constructorValidation() {
    if (!this.#unicityColumns || this.#unicityColumns.length === 0) {
      this.#errors.push(
        new ImportLearnerConfigurationError(
          'Missing unicity configuration',
          VALIDATION_ERRORS.UNICITY_COLUMNS_REQUIRED,
        ),
      );
    }

    this.#hasRequiredProperties();

    if (this.#errors.length > 0) {
      throw this.#errors;
    }
  }

  #hasRequiredProperties() {
    const definedProperties = this.#columnMapping.map((header) => header.config?.property);
    if (!definedProperties.includes('firstName')) {
      this.#errors.push(
        new ImportLearnerConfigurationError(
          `Missing firstName configuration`,
          VALIDATION_ERRORS.FIRSTNAME_PROPERTY_REQUIRED,
        ),
      );
    }
    if (!definedProperties.includes('lastName')) {
      this.#errors.push(
        new ImportLearnerConfigurationError(
          `Missing lastName configuration`,
          VALIDATION_ERRORS.LASTNAME_PROPERTY_REQUIRED,
        ),
      );
    }
  }

  #setUnicityColumnMapping() {
    this.#unicityColumnMapping = this.#unicityColumns.reduce((unicityColumnMapping, unicityKey) => {
      const { config } = this.#columnMapping.find((column) => column.name === unicityKey);

      unicityColumnMapping[unicityKey] = config?.property || unicityKey;

      return unicityColumnMapping;
    }, {});
  }

  #lineToOrganizationLearnerAttributes(learner) {
    const learnerAttributes = { organizationId: this.#organizationId };

    this.#columnMapping.forEach((column) => {
      let value = learner[column.name];

      if (column.config?.mappingValues && column.config.mappingValues[value]) {
        value = column.config.mappingValues[value];
      }

      if (column.config?.property) {
        learnerAttributes[column.config.property] = value;
      } else {
        const columnName = column.config?.mappingColumn ?? column.name;
        learnerAttributes[columnName] = this.#formatLearnerAttribute({
          attribute: value,
          columnName,
        });
      }
    });

    return learnerAttributes;
  }

  #formatLearnerAttribute({ attribute, columnName }) {
    if (!attribute) return null;

    if (this.#validationRuleList.length > 0) {
      const dateFormat = this.#columnMapping.find(
        (header) => header.config?.validate?.type === 'date' && header.name === columnName,
      );

      if (dateFormat) {
        return convertDateValue({
          dateString: attribute,
          inputFormat: dateFormat.config.validate.format,
          alternativeInputFormat: dateFormat.config.validate.format,
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

  setExistingLearners(existingLearners = []) {
    this.#existingLearners = existingLearners;
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

      if (error.why === 'field_bad_values') {
        this.#errors.push(new CsvImportError(error.code, { line, field, valids: error.valids }));
      }

      if (error.why === 'string_too_short') {
        this.#errors.push(new CsvImportError(error.code, { line, field, acceptedFormat: error.acceptedFormat }));
      }

      if (error.why === 'string_too_long') {
        this.#errors.push(new CsvImportError(error.code, { line, field, acceptedFormat: error.acceptedFormat }));
      }

      if (error.why === 'string_wrong_length') {
        this.#errors.push(new CsvImportError(error.code, { line, field, acceptedFormat: error.acceptedFormat }));
      }

      if (error.why === 'string_wrong_pattern') {
        this.#errors.push(new CsvImportError(error.code, { line, field }));
      }
    });
  }

  #getCsvLine(index) {
    const LEARNER_DATA_CSV_STARTING_AT_LINE = 2;

    return index + LEARNER_DATA_CSV_STARTING_AT_LINE;
  }

  #checkUnicityRule(learner) {
    const unicityLearnerValue = this.#getUnicityValue(learner);
    if (!this.#unicityKeys.has(unicityLearnerValue)) {
      this.#unicityKeys.set(unicityLearnerValue, learner);
      return null;
    } else {
      const duplicateLearner = this.#unicityKeys.get(unicityLearnerValue);
      if (!this.#areLearnersEqual(duplicateLearner, learner)) {
        return ModelValidationError.unicityError({
          key: this.#unicityColumns.join('-'),
        });
      }
      return null;
    }
  }

  #getLearnerUnicityObject(learner) {
    return this.#unicityColumns.reduce((unicityObjectKeys, rule) => {
      unicityObjectKeys[rule] = learner[rule];

      return unicityObjectKeys;
    }, {});
  }

  #validateRules(learner) {
    const errors = [];

    const unicityError = this.#checkUnicityRule(learner);

    if (unicityError) {
      errors.push(unicityError);
    }

    if (this.#validationRuleList.length > 0) {
      const validationErrors = validateCommonOrganizationLearner(learner, this.#validationRuleList);

      if (validationErrors) {
        errors.push(...validationErrors);
      }
    }

    if (errors.length > 0) {
      throw errors;
    }
  }

  #getUnicityValue(learner) {
    const learnerUnicityObject = this.#getLearnerUnicityObject(learner);
    return Object.values(learnerUnicityObject).join('-');
  }

  #areLearnersEqual(learner1, learner2) {
    for (const column of this.#columnMapping) {
      if (learner1[column.name] !== learner2[column.name]) {
        return false;
      }
    }
    return true;
  }

  get filtersAvailableValues() {
    return this.#columnMapping
      .filter((header) => header.config?.displayable?.filterable?.type === 'list')
      .map((header) => {
        const key = header.config?.property ?? header.config?.mappingColumn ?? header.name;
        const isProperty = Boolean(header.config?.property);

        const attributeName = header.config.displayable.name;

        const values = [
          ...new Set(
            this.#learners
              .map((learner) => (isProperty ? learner[key] : learner.attributes?.[key]))
              .filter((value) => value != null),
          ),
        ];

        return new CommonOrganizationLearnerFilter({ organizationId: this.#organizationId, attributeName, values });
      });
  }

  get learners() {
    const learners = {
      list: [],
      existinglearnerIds: [],
    };

    this.#learners.forEach((learner) => {
      const learnerAlreadyExist = learners.list.find((existingLearner) => learner.isEqual(existingLearner));
      if (learnerAlreadyExist) {
        return;
      }
      learner.updateLearner({
        learnerList: this.#existingLearners,
        unicityKey: Object.values(this.#unicityColumnMapping),
      });

      learners.list.push(learner);

      if (learner.id) learners.existinglearnerIds.push(learner.id);
    });

    return learners;
  }
}

export { ImportOrganizationLearnerSet };
