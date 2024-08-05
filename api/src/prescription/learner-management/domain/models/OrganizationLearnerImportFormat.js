class OrganizationLearnerImportFormat {
  constructor({ name, fileType, config } = {}) {
    this.name = name;
    this.fileType = fileType;
    this.config = config;
  }

  #sortObject = (columnA, columnB) => columnA.position - columnB.position;

  get reconciliationFields() {
    return this.config.reconciliationMappingColumns
      .slice()
      .sort(this.#sortObject)
      .map(({ name, fieldId, key }) => {
        const { type } = this.config.validationRules.formats.find((format) => format.key === key);
        return { name, fieldId, type };
      });
  }

  get headersFields() {
    return this.config.headers;
  }

  get orderedDisplayabledColumns() {
    if (!this.config.displayableColumns) return [];

    return this.config.displayableColumns.slice().sort(this.#sortObject);
  }

  get columnsToDisplay() {
    return this.orderedDisplayabledColumns.map((column) => column.name);
  }

  get extraColumns() {
    return this.orderedDisplayabledColumns.map((column) => {
      const { name: key } = this.config.headers.find((header) => header.key === column.key);
      return {
        name: column.name,
        key,
      };
    });
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
      const reconciliationField = this.config.reconciliationMappingColumns.find((column) => column.fieldId === fieldId);
      const header = this.headersFields.find((column) => column.key === reconciliationField.key);
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
