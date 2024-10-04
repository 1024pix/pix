import Joi from 'joi';

import { EntityValidationError } from '../../../../shared/domain/errors.js';

const organizationLearnerImportFormatSchame = Joi.object({
  name: Joi.string().required(),
  config: Joi.object().required(),
  fileType: Joi.string().valid('csv', 'xml'),
});
class OrganizationLearnerImportFormat {
  /**
   * @param data
   * @param {string} data.name
   * @param {string} data.fileType
   * @param {Object} data.config
   */
  constructor({ name, fileType, config } = {}) {
    this.name = name;
    this.fileType = fileType;
    this.config = config;

    this.#validate();
  }

  #validate() {
    const { error } = organizationLearnerImportFormatSchame.validate(this, { abortEarly: false });

    if (error) {
      throw EntityValidationError.fromJoiErrors(error.details);
    }
  }

  #sortObject = (columnA, columnB) => columnA.position - columnB.position;

  get #displayable() {
    return this.config.headers.flatMap((header) => (header?.config?.displayable ? header : [])).slice();
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

  get headersName() {
    return this.config.headers.map(({ name }) => ({ name }));
  }

  get orderedDisplayabledColumns() {
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

  get columnsToDisplay() {
    return this.orderedDisplayabledColumns.map((column) => column.name);
  }

  get filtersToDisplay() {
    return this.orderedFilterableColumns.map((column) => column.name);
  }

  get extraColumns() {
    return this.#displayable.map((header) => {
      return {
        name: header.config.displayable.name,
        key: header.name,
      };
    });
  }

  get exportableColumns() {
    return this.config.headers.flatMap(({ name, config }) => (config?.exportable ? { columnName: name } : []));
  }

  /**
   * @function
   * Transform form params into a repository compliant params
   * It will take params name from reconciliationMappingColumns and
   * use the corresponding columns name to host the value in an attributes object
   * Values associated to header columns that have a property key will be set on
   * the main returned object.
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
}

export { OrganizationLearnerImportFormat };
