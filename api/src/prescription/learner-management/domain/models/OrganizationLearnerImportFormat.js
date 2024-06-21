class OrganizationLearnerImportFormat {
  constructor({ name, fileType, config } = {}) {
    this.name = name;
    this.fileType = fileType;
    this.config = config;
  }

  get reconciliationFields() {
    return this.config.reconciliationMappingColumns;
  }

  get headersFields() {
    return this.config.headers;
  }

  /**
   * @function
   * Transform form params into a repository compliant params
   * It will take params name from reconciliationFields and
   * use the corresponding columns name to host the value in an attributes object
   * Values associated to header columns that have a property key will be set on
   * the main returned object.
   * @name transformReconciliationData
   * @param {Object} params
   * @returns {Promise<boolean>}
   */

  transformReconciliationData(params) {
    return Object.entries(params).reduce((obj, [fieldName, value]) => {
      const reconciliationField = this.reconciliationFields.find((field) => field.key === fieldName);
      const header = this.headersFields.find((column) => column.name === reconciliationField.columnName);
      if (header.property) {
        obj[header.property] = value;
      } else {
        if (!obj.attributes) {
          obj.attributes = {};
        }
        obj.attributes[header.name] = value;
      }
      return obj;
    }, {});
  }
}

export { OrganizationLearnerImportFormat };
