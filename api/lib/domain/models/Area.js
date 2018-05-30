class Area {
  constructor(_ = {}) {
  }

  /**
   * @deprecated
   */
  static fromAttributes(attributes) {
    const area = new Area();
    return Object.assign(area, attributes);
  }
}

module.exports = Area;
