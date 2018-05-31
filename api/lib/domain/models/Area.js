class Area {

  constructor({ id, name, code, title } = {}) {
    this.id = id;
    this.name = name;
    this.code = code;
    this.title = title;
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
