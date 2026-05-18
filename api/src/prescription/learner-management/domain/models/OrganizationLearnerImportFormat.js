import dayjs from 'dayjs';
import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';
import { ANONYMIZATION_RULE } from '../constants.js';

const organizationLearnerImportFormatSchame = Joi.object({
  id: Joi.number(),
  name: Joi.string().required(),
  config: Joi.object().required(),
  fileType: Joi.string().valid('csv', 'xml'),
  createdAt: Joi.date().required(),
  createdBy: Joi.number().required(),
});

class OrganizationLearnerImportFormat {
  /**
   * @param data
   * @param {string} data.name
   * @param {string} data.fileType
   * @param {Object} data.config
   * @param {Object} data.createdAt
   * @param {Object} data.createdBy
   */
  constructor({ id, name, fileType, config, createdAt, createdBy } = {}) {
    this.id = id;
    this.name = name;
    this.fileType = fileType;
    this.config = config;
    this.createdAt = createdAt;
    this.createdBy = createdBy;

    this.#validate();
  }

  anonymizeAttributes(attributes) {
    if (!attributes) return null;

    const result = { ...attributes };

    for (const header of this.config.headers) {
      if (header.config?.property) continue;

      const key = header.config?.mappingColumn ?? header.name;

      if (!(key in result)) continue;

      const rule = header.config?.anonymize ?? ANONYMIZATION_RULE.KEEP;

      switch (rule) {
        case ANONYMIZATION_RULE.CLEAR:
          delete result[key];
          break;
        case ANONYMIZATION_RULE.GENERALIZE_DATE:
          result[key] = result[key] ? this.#setDateToFirstJanuary(result[key]) : null;
          break;
      }
    }

    return result;
  }

  get columnsToDisplay() {
    return this.orderedDisplayableColumns.map((column) => column?.config?.mappingColumn ?? column.name);
  }

  get exportableColumns() {
    return this.config.headers.flatMap(({ name, config }) =>
      config?.exportable ? { columnName: config.mappingColumn ?? name } : [],
    );
  }

  get extraColumns() {
    return this.#displayable.map((header) => {
      const key = header.config.mappingColumn ?? header.name;

      return {
        name: header.config.displayable.name,
        key,
      };
    });
  }

  get filtersToDisplay() {
    return this.orderedFilterableColumns.map((column) => column?.config?.mappingColumn ?? column.name);
  }

  get headersName() {
    return this.config.headers.map(({ name }) => ({ name }));
  }

  get orderedDisplayableColumns() {
    return this.#displayable
      .map(({ config }) => {
        return { name: config.displayable.name, position: config.displayable.position };
      })
      .sort(this.#sortObject);
  }

  get orderedFilterableColumns() {
    return this.#displayable
      .flatMap(({ config }) =>
        config.displayable.filterable?.type
          ? { name: config.displayable.name, position: config.displayable.position }
          : [],
      )
      .sort(this.#sortObject);
  }

  get reconciliationFields() {
    return this.config.headers
      .flatMap((header) =>
        header?.config?.reconcile
          ? {
              name: header.config.reconcile.name,
              fieldId: header.config.reconcile.fieldId,
              position: header.config.reconcile.position,
              type: header.config.validate.type,
            }
          : [],
      )
      .sort(this.#sortObject);
  }

  /**
   * @function
   * Transform form params into a repository compliant params.
   *
   * It will take params name from reconciliationMappingColumns and
   * use the corresponding columns name to host the value in an attributes object
   *
   * Values associated to header columns that have a property key will be set on
   * the main returned object.
   *
   * @name transformReconciliationData
   * @param {Object} params
   * @returns {Promise<boolean>}
   */
  transformReconciliationData(params) {
    return Object.entries(params).reduce((obj, [fieldId, value]) => {
      const reconciliationField = this.config.headers.find(({ config }) => config?.reconcile?.fieldId === fieldId);
      if (reconciliationField.config.property) {
        obj[reconciliationField.config.property] = value;
      } else {
        if (!obj.attributes) {
          obj.attributes = {};
        }
        obj.attributes[reconciliationField.name] = value;
      }
      return obj;
    }, {});
  }

  get #displayable() {
    return this.config.headers.flatMap((header) => (header?.config?.displayable ? header : [])).slice();
  }

  #setDateToFirstJanuary(date) {
    return dayjs(date).set('date', 1).set('month', 0).format('YYYY-MM-DD');
  }

  #sortObject = (columnA, columnB) => columnA.position - columnB.position;

  #validate() {
    const { error } = organizationLearnerImportFormatSchame.validate(this, { abortEarly: false });

    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }
}

export { OrganizationLearnerImportFormat };
