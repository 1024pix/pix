class StructureCategory {
  /**
   * @param {object} params
   * @param {number} params.id
   * @param {string} params.label
   */
  constructor({ id, label } = {}) {
    this.id = id;
    this.label = label;
  }
}

export { StructureCategory };
