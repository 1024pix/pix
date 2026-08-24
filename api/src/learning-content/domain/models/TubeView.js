export class TubeView {
  /**
   * @param {object} params
   * @param {string} params.id
   * @param {string} params.name
   * @param {object} params.practicalTitle_i18n
   */
  constructor({ id, name, practicalTitle_i18n }) {
    this.id = id;
    this.name = name;
    this.practicalTitle_i18n = practicalTitle_i18n;
  }
}
