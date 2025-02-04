export class Competence {
  /**
   * @param {Object} props
   * @param {string} props.code
   * @param {string} props.name
   * @param {string} props.areaName
   * @param {string} props.level
   */
  constructor({ code, name, areaName, level }) {
    this.code = code;
    this.name = name;
    this.areaName = areaName;
    this.level = level;
  }
}
